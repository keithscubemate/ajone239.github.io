---
layout: page
title: Advent of Code 2024 Day 1
author: Austin Jones
---

This is the first entry in a series of posts I'm making for the "Advent of Code 2024".
In short, the Advent of Code is a set of coding challenges that fit into the format of an advent calendar.
So for all the days in December leading up to Christmas, there will be a fun (and slightly contrived) coding problem following a Christmas story.

Each day comes with a part A and B.
B will always build on A in some way, so it's a fun challenge to design A in a way that B can be made with little change to the core logic.

In these posts, I will cover my approach and solution to these coding problems.
This will be an exercise in communicating my work.
It also might happen to help someone understand the problems as well.

If the code snippets don't do it for you; please go [here](https://github.com/ajone239/advent_of_code_2024) to find my source.

# Part A

## The Problem

There are two lists of IDs that make up the problem input.
The goal of this problem is to compare these lists to see how different they are.
This is too be done by summing the difference of the two smallest elements with the second-smallest difference and so on.

## The Solution

As one can imagine with day 1 part 1, this is rather simple.
The plan is to:

- read in the lists
- sort them
- take the difference
- sum them

With the exception of needing to take the absolute value of the difference, this worked!

```rust
use std::io;

use anyhow::Result;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut left = vec![];
    let mut rite = vec![];

    for line in stdin.lines() {
        let line = line.unwrap();

        let mut vals = line.split_whitespace().map(|s| s.parse::<i32>().unwrap());

        left.push(vals.next().unwrap());
        rite.push(vals.next().unwrap());
    }

    left.sort();
    rite.sort();

    let difference: i32 = left
        .into_iter()
        .zip(rite.into_iter())
        .map(|(l, r)| r - l)
        .map(|d| d.abs())
        .sum();

    println!("{}", difference);

    Ok(())
}
```


# Part B

## The Twist

As it turns out, the difference between the two lists is a bad measure of the similarity of them.
So instead of the difference, we will find the "similarity score".
This score is the sum of each left entry multiplied by it's number of occurrences in the right list.

## How we Adapt

From part A we already have the lists of the left and right numbers.
So, to get the count of frequency in the right list, we can do so with a hash map.

```rust
        let rite_val = vals.next().unwrap();
        *rite.entry(rite_val).or_insert(0) += 1;
```

Once we have that, we change the difference finder to the "similarity score" calculation.

```rust
    let difference: i32 = left
        .into_iter()
        .map(|l| l * rite.get(&l).unwrap_or(&0))
        .sum();
```

# Conclusion

As it was the first day, this was understandably easy.
However, I hope my explanation and thoughts on the problem was interesting.
Happy coding.
