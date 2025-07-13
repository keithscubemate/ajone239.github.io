---
layout: page
title: Advent of Code 2024 Day 8
author: Austin Jones
---

[Today's problem](https://adventofcode.com/2024/day/8) has us calculating antinodes of cell towers.
As per use you can find the solutions discussed below on [my github](https://github.com/ajone239/advent_of_code_2024/tree/main/day_8a).

# Part A

## The Problem

There are a litany of cell towers in the north pole.
We must calculate and find all the antinodes.
Antinodes are points collinear to two towers that are one distance `d` away from either tower where `d` is the distance between the towers.
We need to return the number of spaces in the map covered by antinodes.

## The Solution

The goal is to read, parse, process, and print.
It's day 8; you know the drill.

In the map there is more than one kind of cell tower, so we can separate them for processing.

```rust
let mut antenas: HashMap<char, Vec<Point>> = HashMap::new();

for (i, row) in lines.into_iter().enumerate() {
    for (j, cell) in row.into_iter().enumerate() {
        if cell == '.' {
            continue;
        }

        let point = Point {
            x: i as isize,
            y: j as isize,
        };

        antenas.entry(cell).or_default().push(point);
    }
}
```

Then we need to process them.
We need to process every pair, but the processing is communitive so only once.
We can do that by processing like so:

```rust
for i in 0..towers.len() - 1 {
    let start = &towers[i];

    for other in &towers[i + 1..] {
        let (f, b) = start.project(other);

        antinodes.insert(f);
        antinodes.insert(b);
    }
}
```

The last part of the process is to project it.
I changed my major enough in college to have done some vector math.
So we project like so:

```
     # an1 = t1 + c
     *
     *
     *
     o t1
    /^
 a / .
  /  . c = a - b
 /   .
+----o t2
  b  *
     *
     *
     *
     # an2 = t2 - c
```

```rust
struct Point {
    x: isize,
    y: isize,
}

impl Point {
    fn project(&self, other: &Self) -> (Point, Point) {
        let x_diff = self.x - other.x;
        let y_diff = self.y - other.y;

        let forward = Point {
            x: self.x + x_diff,
            y: self.y + y_diff,
        };
        let backward = Point {
            x: other.x - x_diff,
            y: other.y - y_diff,
        };

        (forward, backward)
    }
}

```

## The Full Solution

This comes together like so:

```rust
use std::{
    collections::{HashMap, HashSet},
    io,
};

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut lines: Vec<Vec<char>> = vec![];

    for line in stdin.lines() {
        let line = line?;
        lines.push(line.chars().collect());
    }

    let width = lines.len() as isize;
    let height = lines[0].len() as isize;

    let mut antenas: HashMap<char, Vec<Point>> = HashMap::new();

    for (i, row) in lines.into_iter().enumerate() {
        for (j, cell) in row.into_iter().enumerate() {
            if cell == '.' {
                continue;
            }

            let point = Point {
                x: i as isize,
                y: j as isize,
            };

            antenas.entry(cell).or_default().push(point);
        }
    }

    let mut antinodes = HashSet::new();

    for (_, towers) in &antenas {
        for i in 0..towers.len() - 1 {
            let start = &towers[i];
            for other in &towers[i + 1..] {
                let (f, b) = start.project(other);

                antinodes.insert(f);
                antinodes.insert(b);
            }
        }
    }

    let count = antinodes
        .into_iter()
        .filter(|Point { x, y }| *x < width && *y < height && *y >= 0 && *x >= 0)
        .count();

    println!("{:?}", count);

    Ok(())
}

#[derive(Debug, PartialEq, Eq, Hash)]
struct Point {
    x: isize,
    y: isize,
}

impl Point {
    fn project(&self, other: &Self) -> (Point, Point) {
        let x_diff = self.x - other.x;
        let y_diff = self.y - other.y;

        let forward = Point {
            x: self.x + x_diff,
            y: self.y + y_diff,
        };
        let backward = Point {
            x: other.x - x_diff,
            y: other.y - y_diff,
        };

        (forward, backward)
    }
}
```

# Part B

## The Twist

The twist is that instead of two antinodes as above, the antinodes go on forever.
We are still to calc and count them.

## How we Adapt

If you know Haskell, I'm sure there's some cool lazy iterator solution for this that will return what you need.
I just increased the expansion from 1 to 50 on each side.
It worked like a charm and took my about 30 seconds to implement.
The best application you'll write is the one that ships.

```rust
fn project(&self, other: &Self) -> Vec<Point> {
    let x_diff = self.x - other.x;
    let y_diff = self.y - other.y;

    let mut rv = vec![];

    for i in 0..50 {
        let forward = Point {
            x: self.x + x_diff * i,
            y: self.y + y_diff * i,
        };
        let backward = Point {
            x: other.x - x_diff * i,
            y: other.y - y_diff * i,
        };

        rv.push(forward);
        rv.push(backward);
    }

    rv
}
```

## The Full Solution

```rust
use std::{
    collections::{HashMap, HashSet},
    io,
};

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut lines: Vec<Vec<char>> = vec![];

    for line in stdin.lines() {
        let line = line?;

        if line.is_empty() {
            break;
        }

        lines.push(line.chars().collect());
    }

    let width = lines.len() as isize;
    let height = lines[0].len() as isize;

    let mut antenas: HashMap<char, Vec<Point>> = HashMap::new();

    for (i, row) in lines.into_iter().enumerate() {
        for (j, cell) in row.into_iter().enumerate() {
            if cell == '.' {
                continue;
            }

            let point = Point {
                x: i as isize,
                y: j as isize,
            };

            antenas.entry(cell).or_default().push(point);
        }
    }

    let mut antinodes = HashSet::new();

    for (_, towers) in &antenas {
        for i in 0..towers.len() - 1 {
            let start = &towers[i];
            for other in &towers[i + 1..] {
                let nodes = start.project(other);

                for n in nodes {
                    antinodes.insert(n);
                }
            }
        }
    }

    let count = antinodes
        .into_iter()
        .filter(|Point { x, y }| *x < width && *y < height && *y >= 0 && *x >= 0)
        .count();

    println!("{:?}", count);

    Ok(())
}

#[derive(Debug, PartialEq, Eq, Hash)]
struct Point {
    x: isize,
    y: isize,
}

impl Point {
    fn project(&self, other: &Self) -> Vec<Point> {
        let x_diff = self.x - other.x;
        let y_diff = self.y - other.y;

        let mut rv = vec![];

        for i in 0..50 {
            let forward = Point {
                x: self.x + x_diff * i,
                y: self.y + y_diff * i,
            };
            let backward = Point {
                x: other.x - x_diff * i,
                y: other.y - y_diff * i,
            };

            rv.push(forward);
            rv.push(backward);
        }

        rv
    }
}
```
