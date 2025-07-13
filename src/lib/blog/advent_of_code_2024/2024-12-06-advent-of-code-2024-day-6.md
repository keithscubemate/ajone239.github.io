---
layout: page
title: Advent of Code 2024 Day 6
author: Austin Jones
---

[Today's problem](https://adventofcode.com/2024/day/6) has guards walking around a lab we need to investigate.
The guards (automata) walk around following tight training (rules).
It is our job to study and predict their paths.
Today's part 2 kept me up til 4a.m. so I hope you like the read.
As per use you can find the solutions discussed below on [my github](https://github.com/ajone239/advent_of_code_2024/tree/main/day_6a).

# Part A

## The Problem

As mentioned above, the is a lab with a guard in it.
This guard follows a predictable set of rules:

- If facing a wall, turn clockwise 90 degrees
- else step forward one space in the currently faced direction.

This will be followed until the guard leaves the map.
With this established, it would useful to know all the uniquely occupied squares of the guard.

## The Solution

### The plan

Today's problem is one with a few moving parts.
The map and it's walls along with the guards position and direction need to be maintained just to represent the world state.
Further accommodations are required to track cycles and such.
This will give us excuse to use some of Rust's cool features.

Our plan here is similar to the other days:

- Parse in the map
- run the automata until it is done
- count up the visited squares
- return

This article is written after I've done both parts, so I can't walk through all the predesign decisions in the sincerity of ignorance.
But an addition I made to part A that wasn't necessary was cycle detection.
This was done to catch test cases where the guard doesn't leave the lab (which turned out to never happen).

As an aside, it's worth thinking of how this problem could grow or change.
Since it is an automata, the rules could easily change, so keeping them loosely coupled and extendible is a must have.
Similarly, adding more guards is always a possibility, so it is good to keep your logic for handling the automata cordoned into reproducible units.
The processing of the walked path could change; so keeping a record of where you've been will always be useful.
I digress.

### Rust is cool

I said above that this problem leverages some cool parts of Rust.
Rust is one of my favorite languages right now.
Far and away from the usual safety concerns that the pundit hock, Rust is full of idioms that I find myself needing in other languages.

If I could take _one_ thing from Rust into any other language, it would be the monadic return types that shoe horn [railway programming](https://blog.logrocket.com/what-is-railway-oriented-programming/).
But if I could take two things; Rust enums would get to come too.

Enums in the C-likes are really just sugar over integer values.
In Rust, they are rich, fast, zero-cost abstractions for representing state.
In our problem here, we need to represent direction.
So then what better way to do that then with the 4 cardinal directions.

```rust
enum Direction {
    North,
    South,
    East,
    West,
}
```

That is nice and better than using a char, but it's not cool enough to be a sub sub heading in a blog post that 2 people might read.
It gets cool when you tie functionality to the enum.
Rust's data model is based on data and associated functionality.
C++/C# envelope the functionality in the data with classes.
However, C classically doesn't do this, however C sucks to type out.
Rust, like C, maintains this separation with an ergonomic boost.
The data in Rust is a `struct`, `enum`, `tuple`; the functionality is shown in `impl` blocks.
Ever close to digression, here is the example for our enum above.

```rust
impl Direction {
    fn rotate_cw(&self) -> Self {
        match self {
            Self::North => Self::East,
            Self::East => Self::South,
            Self::South => Self::West,
            Self::West => Self::North,
        }
    }

    fn to_delta(&self) -> (isize, isize) {
        match self {
            Self::North => (-1, 0),
            Self::East => (0, 1),
            Self::South => (1, 0),
            Self::West => (0, -1),
        }
    }
}

// usage
let (dx, dy) = self.guard_direction.to_delta();

if self.map[new_x][new_y] == Square::Wall {
    self.guard_direction = self.guard_direction.rotate_cw();
    continue;
}
```

So, this saves us abunch of ugly if statements of `direction_to_delta()` functions.

### The implementation

The main work for this was in the function that advanced the automaton.
The basic flow is:

- get current position and direction
- try to advance
- on fail turn
- on success move
- exit on loop or exit of map
- goto top

How this shook out, you can see in the code below.
Cycle detection will be discussed more in part B.

## The Full Solution

This is the entire solution.
The boiler plate for this one was a bit more chunky that the others of late.
But once it was processed in, it wasn't too bad.

```rust
use std::{
    collections::HashSet,
    fmt::{Debug, Write},
    io,
};

use anyhow::Result;

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

    let mut map = Map::new(lines);

    while PathState::New == map.advance() {}

    let result = map
        .map
        .iter()
        .flat_map(|row| row.iter())
        .filter(|c| **c == Square::Visited || **c == Square::Guard)
        .count();

    println!("{}", result);

    Ok(())
}

#[derive(Hash, Eq, PartialEq, Copy, Clone, Debug)]
enum PathState {
    New,
    Looping,
    Gone,
}

#[derive(Hash, Eq, PartialEq, Copy, Clone, Debug)]
enum Direction {
    North,
    South,
    East,
    West,
}

impl Direction {
    fn rotate_cw(&self) -> Self {
        match self {
            Self::North => Self::East,
            Self::East => Self::South,
            Self::South => Self::West,
            Self::West => Self::North,
        }
    }

    fn to_delta(&self) -> (isize, isize) {
        match self {
            Self::North => (-1, 0),
            Self::East => (0, 1),
            Self::South => (1, 0),
            Self::West => (0, -1),
        }
    }
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord)]
enum Square {
    Unvisited,
    Visited,
    Wall,
    Guard,
}

impl Debug for Square {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let disp = match self {
            Self::Unvisited => ' ',
            Self::Visited => 'X',
            Self::Wall => '#',
            Self::Guard => '@',
        };

        f.write_char(disp)
    }
}

struct Map {
    width: usize,
    height: usize,
    map: Vec<Vec<Square>>,
    guard_direction: Direction,
    guard_location: (usize, usize),
    seen: HashSet<(usize, usize, Direction)>,
}

impl Map {
    fn new(map: Vec<Vec<char>>) -> Self {
        let width = map[0].len();
        let height = map.len();
        let seen = HashSet::new();

        let mut processed_map = vec![vec![Square::Unvisited; map[0].len()]; map.len()];
        let mut guard_direction: Direction = Direction::North;
        let mut guard_location: (usize, usize) = (0, 0);

        for (i, row) in map.into_iter().enumerate() {
            for (j, cell) in row.into_iter().enumerate() {
                match cell {
                    '#' => processed_map[i][j] = Square::Wall,
                    '^' | '<' | '>' | 'v' => processed_map[i][j] = Square::Guard,
                    _ => continue,
                }

                let direction = match cell {
                    '^' => Direction::North,
                    '<' => Direction::West,
                    '>' => Direction::East,
                    'v' => Direction::South,
                    _ => continue,
                };

                guard_direction = direction;
                guard_location = (i, j);
            }
        }

        Self {
            width,
            height,
            map: processed_map,
            guard_location,
            guard_direction,
            seen,
        }
    }

    fn advance(&mut self) -> PathState {
        self.seen.insert((
            self.guard_location.0,
            self.guard_location.1,
            self.guard_direction,
        ));

        let (old_x, old_y) = self.guard_location;

        let mut new_x;
        let mut new_y;
        loop {
            let (dx, dy) = self.guard_direction.to_delta();

            new_x = (self.guard_location.0 as isize + dx) as usize;
            new_y = (self.guard_location.1 as isize + dy) as usize;

            if new_x >= self.height || new_y >= self.width {
                self.guard_direction = self.guard_direction.rotate_cw();
                return PathState::Gone;
            }

            if self.map[new_x][new_y] == Square::Wall {
                self.guard_direction = self.guard_direction.rotate_cw();
                continue;
            }

            break;
        }

        let new_tile = (new_x, new_y, self.guard_direction);

        if self.seen.contains(&new_tile) {
            return PathState::Looping;
        }

        self.map[old_x][old_y] = Square::Visited;
        self.map[new_x][new_y] = Square::Guard;

        self.guard_location = (new_x, new_y);

        PathState::New
    }
}

impl Debug for Map {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "{:?}", self.guard_direction)?;
        writeln!(f, "{:?}", self.guard_location)?;
        writeln!(f, "{:?}", self.seen)?;

        for row in &self.map {
            writeln!(f, "{:?}", row)?;
        }

        Ok(())
    }
}
```

# Part B

## The Twist

Finding where the guard will be isn't enough; we want to make them loop for eternity.
The goal of part B is to find _all unique_ locations where you can place a new wall s.t. the guard will loop indefinitely.

You'll note that this wasn't called out above as a design consideration; that's because it wasn't.
However, this isn't that invasive of a request.
It can be treated as a middle processing step.

## How we Adapt

So, one insights from the jump: we only need to check for obstacles on the guards path.
This means we can run the automata like normal and check at each step if an inserted wall would cause a cycle.
That is this was solved.
At every step in the journey: a wall was inserted, the guard checked for a cycle, success is tracked.This worked like a charm for the sample input... and every test case I could come up with.
However, for the "real" input, it was no use.

The thing about the problem statement that I didn't realize was that the obstacle is placed at `t[0]`.
So, it will be there from the beginning of the guards journey.
This means, if you place a new wall at a place and you create a cycle but internal to the new structure it doesn't count.
For example,

```
.....    .....
..#..    ..#..
.#.#.    .#v#.
.#.#. -> .#.#.
.....    ..0..
.....    .....
..^..    ..^..
```

Here, the left is the initial map and the right is the false positive cycle.
The new wall is denoted with the `0`.
As you can see, to the guard within the new structure a cycle is obvious.
However to the guard that will hit it from the outside, there will be no such cycle.

Here, the fix is simple, we check all obstacles from the initial state.
With that, we are done!

## Full Solution

```rust
use std::{
    collections::HashSet,
    fmt::{Debug, Write},
    io,
};

use anyhow::Result;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut lines: Vec<Vec<char>> = vec![];

    for line in stdin.lines() {
        let line = line?.trim().to_string();

        if line.is_empty() {
            break;
        }

        lines.push(line.chars().collect());
    }

    let mut map = Map::new(lines);

    let init_local = map.guard_location.clone();

    // let mut i = 0;
    while PathState::New == map.advance() {
        let mut blah = String::new();
        let _ = io::stdin().read_line(&mut blah);
        // i += 1;
        // println!("{}", i);
    }

    println!("{:?}", map);

    println!("{}", map.obstacles.contains(&init_local));
    println!("can loop count: {}", map.obstacles.len());

    Ok(())
}

#[derive(Hash, Eq, PartialEq, Copy, Clone, Debug)]
enum PathState {
    New,
    Gone,
}

#[derive(Hash, Eq, PartialEq, Copy, Clone, Debug)]
enum Direction {
    North,
    South,
    East,
    West,
}

impl Direction {
    fn rotate_cw(&self) -> Self {
        match self {
            Self::North => Self::East,
            Self::East => Self::South,
            Self::South => Self::West,
            Self::West => Self::North,
        }
    }

    fn to_delta(&self) -> (isize, isize) {
        match self {
            Self::North => (-1, 0),
            Self::East => (0, 1),
            Self::South => (1, 0),
            Self::West => (0, -1),
        }
    }
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord)]
enum Square {
    Unvisited,
    Visited,
    Wall,
    Guard,
}

impl Debug for Square {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let disp = match self {
            Self::Unvisited => '.',
            Self::Visited => 'X',
            Self::Wall => '#',
            Self::Guard => '@',
        };

        f.write_char(disp)
    }
}

struct Map {
    width: usize,
    height: usize,
    map: Vec<Vec<Square>>,
    guard_direction: Direction,
    init_direction: Direction,
    guard_location: (usize, usize),
    init_location: (usize, usize),
    seen: HashSet<(usize, usize, Direction)>,
    obstacles: HashSet<(usize, usize)>,
}

impl Map {
    fn new(map: Vec<Vec<char>>) -> Self {
        let width = map[0].len();
        let height = map.len();
        let seen = HashSet::new();
        let obstacles = HashSet::new();

        let mut processed_map = vec![vec![Square::Unvisited; map[0].len()]; map.len()];
        let mut guard_direction: Direction = Direction::North;
        let mut guard_location: (usize, usize) = (0, 0);

        for (i, row) in map.into_iter().enumerate() {
            for (j, cell) in row.into_iter().enumerate() {
                match cell {
                    '#' => processed_map[i][j] = Square::Wall,
                    '^' | '<' | '>' | 'v' => processed_map[i][j] = Square::Guard,
                    _ => continue,
                }

                let direction = match cell {
                    '^' => Direction::North,
                    '<' => Direction::West,
                    '>' => Direction::East,
                    'v' => Direction::South,
                    _ => continue,
                };

                guard_direction = direction;
                guard_location = (i, j);
            }
        }

        Self {
            width,
            height,
            map: processed_map,
            guard_location,
            guard_direction,
            init_location: guard_location,
            init_direction: guard_direction,
            seen,
            obstacles,
        }
    }

    fn advance(&mut self) -> PathState {
        self.seen.insert((
            self.guard_location.0,
            self.guard_location.1,
            self.guard_direction,
        ));

        let (old_x, old_y) = self.guard_location;

        let mut new_x;
        let mut new_y;
        loop {
            let (dx, dy) = self.guard_direction.to_delta();

            new_x = (self.guard_location.0 as isize + dx) as usize;
            new_y = (self.guard_location.1 as isize + dy) as usize;

            if new_x >= self.height || new_y >= self.width {
                return PathState::Gone;
            }

            if self.map[new_x][new_y] == Square::Wall {
                self.guard_direction = self.guard_direction.rotate_cw();
                continue;
            }

            break;
        }

        self.map[new_x][new_y] = Square::Wall;

        if self.can_loop() {
            self.obstacles.insert((new_x, new_y));
        }

        self.map[old_x][old_y] = Square::Visited;
        self.map[new_x][new_y] = Square::Guard;

        self.guard_location = (new_x, new_y);

        PathState::New
    }

    fn can_loop(&self) -> bool {
        let mut loop_dir = self.init_direction;
        let (mut new_x, mut new_y) = self.init_location;
        let mut next_x;
        let mut next_y;

        let mut seen_internal = HashSet::new();

        loop {
            let (dx, dy) = loop_dir.to_delta();

            next_x = (new_x as isize + dx) as usize;
            next_y = (new_y as isize + dy) as usize;

            if next_x >= self.height || next_y >= self.width {
                return false;
            }

            if self.map[next_x][next_y] == Square::Wall {
                loop_dir = loop_dir.rotate_cw();

                continue;
            }

            let new_tile = (new_x, new_y, loop_dir);

            if !seen_internal.insert(new_tile) {
                return true;
            };

            new_x = next_x;
            new_y = next_y;
        }
    }
}

impl Debug for Map {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "{:?}", self.guard_direction)?;
        writeln!(f, "{:?}", self.guard_location)?;
        writeln!(f, "{:?}", self.obstacles.len())?;
        // writeln!(f, "{:?}", self.seen)?;

        for (i, row) in self.map.iter().enumerate() {
            for (j, cell) in row.iter().enumerate() {
                if self.obstacles.contains(&(i, j)) {
                    write!(f, "0")?;
                } else {
                    write!(f, "{:?}", cell)?;
                }
            }
            writeln!(f)?;
        }

        Ok(())
    }
}
```
