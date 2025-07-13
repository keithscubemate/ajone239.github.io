---
layout: page
title: Advent of Code 2024 Day 11
author: Austin Jones
---

[Today's problem](https://adventofcode.com/2024/day/11) has us dealing with close to infinite objects.
Things grow and multiply; it's our job to represent and handle the size.
As per use you can find the solutions discussed below on [my github](https://github.com/ajone239/advent_of_code_2024/tree/main/day_11a).

# Part A

## The Problem

We are in a corridor.
It is infinite.
We are infinite.

In this corridor there are stones.
Each stone has a number on it.
When you blink, the stones change; some multiply, others grow in number.

The stones change and based off set rules:

> If the stone is engraved with the number 0, it is replaced by a stone engraved with the number 1.
> If the stone is engraved with a number that has an even number of digits, it is replaced by two stones.
> The left half of the digits are engraved on the new left stone, and the right half of the digits are engraved on the new right stone. (The new numbers don't keep extra leading zeroes: 1000 would become stones 10 and 0.)
> If none of the other rules apply, the stone is replaced by a new stone; the old stone's number multiplied by 2024 is engraved on the new stone.

Our job is to return the count of stones after blinking 25 times.

## The Solution

Obligatory plan of read, parse, and process.
How will we handle the stones however?
It will get data heavy, but I think keeping all the stones in a vector will be easy to keep in our heads.

With all the stones in a vector, we can iterate over them and make a new vector.
This is allocation heavy, but hey it's not python.
It's also worth noting that half of the stones (on average) will double.
The _real_ input for the  challenge today is 8 stones long.
Some napkin ([irust](https://github.com/sigmaSd/IRust)) math tells us:

```
In: (0..25).fold(8.0, |acc, _| acc * 1.5) as i32
Out: 202009
```

We will only need 200 kb of my 64 Gb to handle our shoddy solution -- smoke'em while you got'em.

Onto the logistics of the solution, this problem has 4 axes:

- rule complexity
- rule count
- stone count
- blink depth

Rule complexity and complexity is easily handled by "good programming".
Keep your logic tight and separable.
I do this with a lil' house keeping trick known as [Never Nesting](https://youtu.be/CFRhGnuXG-4?si=Qeyde5zl0vKRJlVn).

Stone count and blink depth here are handled by the handwave of "we have the RAM".
This may (will) come back to bite us, so let look at if we need to worry.
As seen above, we can think of this problem like this:

```
(stones) * (1.5) ^ (blinks)
```

Blinks (foreshadowingly) increase the count much more than stones
Returning to the proverbial napkin, let's grow the stone count and the blink depth respectively.

```
// Original
In: (0..25).fold(8.0, |acc, _| acc * 1.5) as i32
Out: 202009

// Stones x 10
In: (0..25).fold(80.0, |acc, _| acc * 1.5) as i32
Out: 2020093

// Blinks x 10
In: (0..250).fold(8.0, |acc, _| acc * 1.5) as i32
Out: 2147483647
```

So if you weren't being lazy, the math above would tell you to make sure you account for the blinks.

## The Full Solution

Anyway, each blink I process each stone into a new array then go again.

```rust
use std::io;

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let mut line = String::new();

    io::stdin().read_line(&mut line)?;

    let line = line.trim();

    let mut stones: Vec<u64> = line
        .split_whitespace()
        .into_iter()
        .map(|s| s.parse().unwrap())
        .collect();

    for i in 0..25 {
        stones = blink(stones);
        println!("{} - {}", i, stones.len());
    }

    Ok(())
}

enum Whoops<T> {
    Single(T),
    Double(T, T),
}

fn blink(stones: Vec<u64>) -> Vec<u64> {
    let mut new_stones = vec![];
    for stone in stones {
        match process_stone(stone) {
            Whoops::Single(s) => new_stones.push(s),
            Whoops::Double(l, r) => {
                new_stones.push(l);
                new_stones.push(r);
            }
        }
    }
    new_stones
}

fn process_stone(stone: u64) -> Whoops<u64> {
    if stone == 0 {
        return Whoops::Single(1);
    }

    let s_str = stone.to_string();

    if s_str.len() & 1 == 1 {
        return Whoops::Single(stone * 2024);
    }

    let chars: Vec<char> = s_str.chars().collect();

    let left: String = chars[..chars.len() / 2].iter().collect();
    let right: String = chars[chars.len() / 2..].iter().collect();

    let left = left.parse().unwrap();
    let right = right.parse().unwrap();

    Whoops::Double(left, right)
}
```

# Part B

## The Twist

The twist was to blink 75 times instead of 25.
Might I add, I like this twist.
Instead of making the problem change, it just demands **more**.

## How we Adapt

So, of course, I tried to run this without changing my code.
It crashed after running for a few minutes -- whomp whomp.

Easy enough, we'll take care of the memory issue with recursion.
75 stack frames is nothing a programmer like me.
We set the depth to our blink count and decrement.
When we hit zero we return a 1 for that stone.
We sum all these results and that our solution.

When we run this it seems to work I guess, but it was slowwwwww.
It was slow enough that I went back to the drawing board again.

Easy again, we can memoize the problem to save unneeded branching.
A quick refresher, memoization is storing the results of a pure function keyed off their inputs to be recalled.
This saves us from doing expensive calculations over and over again.
Note, here we can't just memoize off stone number, we also need depth.

## Full Solution

Running the memoized recursive solution takes &amp&lt; 0.05 seconds.

```rust
use std::{collections::HashMap, io};

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let mut line = String::new();

    io::stdin().read_line(&mut line)?;

    let line = line.trim();

    let stones: Vec<u64> = line
        .split_whitespace()
        .into_iter()
        .map(|s| s.parse().unwrap())
        .collect();

    let mut seen = HashMap::new();
    let result: usize = stones.into_iter().map(|s| blink(s, &mut seen, 75)).sum();

    println!("{}", result);

    Ok(())
}

enum Whoops<T> {
    Single(T),
    Double(T, T),
}

fn blink(stone: u64, seen: &mut HashMap<(u64, usize), usize>, depth: usize) -> usize {
    if depth == 0 {
        return 1;
    }

    if let Some(count) = seen.get(&(stone, depth)) {
        return *count;
    }

    let stone_count = match process_stone(stone) {
        Whoops::Single(s) => blink(s, seen, depth - 1),
        Whoops::Double(l, r) => blink(l, seen, depth - 1) + blink(r, seen, depth - 1),
    };

    seen.insert((stone, depth), stone_count);

    stone_count
}

fn process_stone(stone: u64) -> Whoops<u64> {
    if stone == 0 {
        return Whoops::Single(1);
    }

    let s_str = stone.to_string();

    if s_str.len() & 1 == 1 {
        return Whoops::Single(stone * 2024);
    }

    let chars: Vec<char> = s_str.chars().collect();

    let left: String = chars[..chars.len() / 2].iter().collect();
    let right: String = chars[chars.len() / 2..].iter().collect();

    let left = left.parse().unwrap();
    let right = right.parse().unwrap();

    Whoops::Double(left, right)
}
```
