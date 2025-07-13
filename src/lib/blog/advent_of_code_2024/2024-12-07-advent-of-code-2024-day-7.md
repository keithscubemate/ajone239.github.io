---
layout: page
title: Advent of Code 2024 Day 7
author: Austin Jones
---

[Today's problem](https://adventofcode.com/2024/day/7) has us validating calibration data with unknown equations.
Part B gives a reason to break into Rust's iterators.
As per use you can find the solutions discussed below on [my github](https://github.com/ajone239/advent_of_code_2024/tree/main/day_7a).

# Part A

## The Problem

We are given a list of calibrations; they consist of a target and elements.
A valid calibration is one whose target can be made by adding or multing the elements.
To verify our answer, we sum the targets of the valid calibrations.

## The Solution

The solution is to iterate of all the combinations of adding and multing.
We can do this by generating all the combinations then testing them.
An easy way to generate all the combinations is to iterate from 0 to a number that has a binary 1 for each operator we need to apply: e.g.

```
[1, 2, 3]

0 => 00 -> 1 + 2 + 3 = 6
1 => 01 -> 1 + 2 * 3 = 6
2 => 10 -> 1 * 2 + 3 = 5
3 => 11 -> 1 * 2 * 3 = 6
```

This looks like

```rust
fn is_valid(&self) -> bool {
    let upperlimit = Self::all_ones(self.elements.len() - 1);

    for mask in 0..=upperlimit {
        let mut total: i64 = self.elements[0];

        for (i, elem) in self.elements[1..].iter().enumerate() {
            total = if mask & 1 << i > 0 {
                total * elem
            } else {
                total + elem
            }
        }

        if total == self.target {
            return true;
        }
    }

    false
}

fn all_ones(len: usize) -> u64 {
    let mut rv = 0;
    for i in 0..len {
        rv |= 1 << i;
    }
    rv
}
```

In reading the part A, I thought it was very clear that more operators were on the way.
How did I design for this?
Mentally preparing to rewrite part A.
The bit tricks above are predicated on there being two operators, so /shrug.

## Full Solution

```rust
use std::io;

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut calibrations: Vec<Calibration> = vec![];

    for line in stdin.lines() {
        let line = line?;

        if line.is_empty() {
            break;
        }

        let mut liter = line.split(':');

        let target: i64 = liter.next().unwrap().parse()?;

        let elements: Vec<i64> = liter
            .next()
            .unwrap()
            .split_whitespace()
            .map(|s| s.parse::<i64>().unwrap())
            .collect();

        let cal = Calibration { target, elements };

        calibrations.push(cal);
    }

    let result: i64 = calibrations
        .into_iter()
        .filter(|c| c.is_valid())
        .map(|c| c.target)
        .sum();

    println!("{}", result);

    Ok(())
}

#[derive(Debug)]
struct Calibration {
    target: i64,
    elements: Vec<i64>,
}

impl Calibration {
    fn is_valid(&self) -> bool {
        let upperlimit = Self::all_ones(self.elements.len() - 1);

        for mask in 0..=upperlimit {
            let mut total: i64 = self.elements[0];

            for (i, elem) in self.elements[1..].iter().enumerate() {
                total = if mask & 1 << i > 0 {
                    total * elem
                } else {
                    total + elem
                }
            }

            if total == self.target {
                return true;
            }
        }

        false
    }

    fn all_ones(len: usize) -> u64 {
        let mut rv = 0;
        for i in 0..len {
            rv |= 1 << i;
        }
        rv
    }
}
```

# Part B

## The Twist

As expected, more ops.
The new operator is "concat": i.e. `1 || 23 = 123`
So, what's a man to do.

## How we Adapt

I mentioned above, the bitwise trick was predicated on there being two operators.
This is because we have binary numbers on computers at the time of writing.
So to add more operators, we increase the base!
But how?
Well I'm sure not writing abunch of bitwise math to go from binary to base 3.

So in comes Rust iterators.
What if we could get an iterator for all the numbers from 0 to 2222 in base 3?
Well we can, because software.

```rust
struct AnyBaseDigits {
    base: usize,
    digits: [usize; 32],
}

impl AnyBaseDigits {
    fn new(base: usize) -> Self {
        let digits = [0; 32];

        Self { base, digits }
    }
}
```

Additionally we can do so from the comfort of common idiom, because Rust.

```rust
impl Iterator for AnyBaseDigits {
    type Item = [usize; 32];

    fn next(&mut self) -> Option<Self::Item> {
        let mut i = 0;
        let rv = self.digits.clone();

        while i < self.digits.len() {
            let digit = &mut self.digits[i];
            *digit += 1;

            if *digit < self.base {
                break;
            }

            *digit = 0;
            i += 1;
        }

        Some(rv)
    }
}

```

What this will give us is access to ergonomic iteration of the data coming out of this class.
Each time a for loop calls `next()` the next base `N` will be calculated and returned in a form thats easy to parse.
See the usage in the full solution.

Will the iterator sorted out, all we need to do is properly reduce the values into their targets:

```rust
let mut total: i64 = self.elements[0];

for (i, elem) in self.elements[1..].iter().enumerate() {
    total = match mask[i] {
        0 => total + elem,
        1 => total * elem,
        2 => {
            let mut melem = *elem;
            let mut elem_tens = 1;
            while melem > 0 {
                elem_tens *= 10;
                melem /= 10;
            }

            total * elem_tens + elem
        }
        _ => panic!(),
    }
}
```

## Full Solution

```rust
use core::panic;
use std::io;

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut calibrations: Vec<Calibration> = vec![];

    for line in stdin.lines() {
        let line = line?;

        if line.is_empty() {
            break;
        }

        let mut liter = line.split(':');

        let target: i64 = liter.next().unwrap().parse()?;

        let elements: Vec<i64> = liter
            .next()
            .unwrap()
            .split_whitespace()
            .map(|s| s.parse::<i64>().unwrap())
            .collect();

        let cal = Calibration { target, elements };

        calibrations.push(cal);
    }

    let result: i64 = calibrations
        .into_iter()
        .filter(|c| c.is_valid())
        .map(|c| c.target)
        .sum();

    println!("{}", result);

    Ok(())
}

#[derive(Debug)]
struct Calibration {
    target: i64,
    elements: Vec<i64>,
}

impl Calibration {
    fn is_valid(&self) -> bool {
        let digits = AnyBaseDigits::new(3);

        let power_set_count = 3_i32.pow((self.elements.len() - 1) as u32) as usize;

        for mask in digits.take(power_set_count) {
            let mut total: i64 = self.elements[0];

            for (i, elem) in self.elements[1..].iter().enumerate() {
                total = match mask[i] {
                    0 => total + elem,
                    1 => total * elem,
                    2 => {
                        let mut melem = *elem;
                        let mut elem_tens = 1;
                        while melem > 0 {
                            elem_tens *= 10;
                            melem /= 10;
                        }

                        total * elem_tens + elem
                    }
                    _ => panic!(),
                }
            }

            if total == self.target {
                return true;
            }
        }

        false
    }
}

struct AnyBaseDigits {
    base: usize,
    digits: [usize; 32],
}

impl AnyBaseDigits {
    fn new(base: usize) -> Self {
        let digits = [0; 32];

        Self { base, digits }
    }
}

impl Iterator for AnyBaseDigits {
    type Item = [usize; 32];

    fn next(&mut self) -> Option<Self::Item> {
        let mut i = 0;
        let rv = self.digits.clone();
        while i < self.digits.len() {
            let digit = &mut self.digits[i];
            *digit += 1;

            if *digit < self.base {
                break;
            }

            *digit = 0;
            i += 1;
        }

        Some(rv)
    }
}
```
