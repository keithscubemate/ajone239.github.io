---
layout: page
title: Advent of Code 2024 Day 10
author: Austin Jones
---

[Today's problem](https://adventofcode.com/2024/day/10) has us using path finding to determine the quality of hiking trails.
The twist for today, may just come from me instead of the problem.
As per use you can find the solutions discussed below on [my github](https://github.com/ajone239/advent_of_code_2024/tree/main/day_10a).

# Part A

## The Problem

We are given a topographic map of some mountain.
It is our job to grade trailhead.
The score of a trailhead is the number of peaks (`9`) one can reach from the (`0`) incrementing by one on each step.

## The Solution

My first pass solution was to find each trailhead then walk to each peak and count what I see.
This was easy enough to do recursively.
For each direction I would try to walk, and when I found a peak:

{% highlight rust %}
if cell_value == 9 {
    return 1;
}
{% endhighlight %}

This, however, counted far two many peaks.
I then realized that I was counting the number of routes to each 9 not the nines that I could see.
So, I retro fitted a hash set into the mix to count unit peaks per trailhead.

This easily worked.

## The Full Solution

{% highlight rust %}
use std::{collections::HashSet, io};

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut map: Vec<Vec<u8>> = vec![];

    for line in stdin.lines() {
        let line = line?;

        if line.is_empty() {
            break;
        }

        let line = line
            .chars()
            .map(|c| match c {
                '.' => u8::MAX,
                c => c as u8 - '0' as u8,
            })
            .collect();
        map.push(line);
    }

    let starts: Vec<(usize, usize)> = map
        .iter()
        .enumerate()
        .flat_map(|(i, row)| {
            row.iter()
                .enumerate()
                .filter(|(_, cell)| **cell == 0)
                .map(move |(j, _)| (i, j))
        })
        .collect();

    let result: u32 = starts
        .into_iter()
        .map(|s| {
            let mut summits = HashSet::new();
            let score = score_trail_head(s, &map, &mut summits);
            let is_part_a = true;

            if is_part_a {
                summits.len() as u32
            } else {
                score
            }
        })
        .sum();

    println!("{:?}", result);

    Ok(())
}

fn score_trail_head(
    cell: (usize, usize),
    map: &Vec<Vec<u8>>,
    summits: &mut HashSet<(usize, usize)>,
) -> u32 {
    let (i, j) = cell;
    let cell_value = map[i][j];

    if cell_value == 9 {
        summits.insert(cell);
        return 1;
    }

    let directions = [(0, 1), (1, 0), (-1, 0), (0, -1)];

    let mut sum = 0;

    for dir in directions {
        let new_i = (i as isize + dir.0) as usize;
        let new_j = (j as isize + dir.1) as usize;

        if new_i >= map.len() || new_j >= map[0].len() {
            continue;
        }

        let new_cell_value = map[new_i][new_j];

        if new_cell_value != cell_value + 1 {
            continue;
        }

        sum += score_trail_head((new_i, new_j), map, summits);
    }

    sum
}
{% endhighlight %}

# Part B

## The Twist

The twist today was rather funny as I had done it on accident.
The twist was to count the number of paths to the peaks.
So, I simply switched the code back to my erroneous part A code.

## How we Adapt

There's no source here as there is a flag above (around line 43) that will control part A from B.
Call it luck or foresight, but don't call it bad software.
