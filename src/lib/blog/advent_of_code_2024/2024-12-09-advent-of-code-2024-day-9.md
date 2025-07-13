---
layout: page
title: Advent of Code 2024 Day 9
author: Austin Jones
---

[Today's problem](https://adventofcode.com/2024/day/9) deals with fragmented drives and fixing them.
It's a nice systems programming problem in the midst of this winter.
As per use you can find the solutions discussed below on [my github](https://github.com/ajone239/advent_of_code_2024/tree/main/day_9a).

# Part A

## The Problem

A creature needs more space on their hard drive.
It is our job to reshuffle the file blocks so the fragmentation goes down.
We prove our solution by returning the sum of the file block ids multiplied by their position.

## The Solution

We approach this by having two types of block: file or empty.
Our goal is to fill in all the empty blocks that we can.
We do this by iterating over them and filling them up as much as we can with each tail block.

There are two cases we care about:

- current empty block size >= last file block

In this case, the empty block will consume the whole file block.
We adjust the empty block and discard the file block before continuing.

- current empty block size &amp&lt; last file block

The file block can't fit fully in the empty slot.
We put what we can from the file into the slot, then we push it back to be processed again.

## The Full Solution

```rust
use std::{collections::VecDeque, io};

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut line = String::new();

    stdin.read_line(&mut line)?;

    let line: Vec<_> = line.trim().chars().collect();

    let mut file_blocks = vec![];
    let mut empty_blocks: VecDeque<EmptyBlock> = VecDeque::new();

    let mut index = 0;
    for (id, chunk) in line.chunks(2).enumerate() {
        let file_size = chunk[0] as usize - '0' as usize;

        let file_block = FileBlock {
            id,
            length: file_size,
            index,
        };

        file_blocks.push(file_block);

        index += file_size;

        if chunk.len() <= 1 {
            continue;
        }

        let space_size = chunk[1] as usize - '0' as usize;

        if space_size <= 0 {
            continue;
        }

        let empty_block = EmptyBlock {
            length: space_size,
            index,
        };
        empty_blocks.push_back(empty_block);

        index += space_size
    }

    let mut new_file_blocks = vec![];

    while empty_blocks.len() > 0 {
        let Some(mut empty_block) = empty_blocks.pop_front() else {
            break;
        };

        while empty_block.length > 0 {
            let Some(mut last_file_block) = file_blocks.pop() else {
                break;
            };

            if empty_block.index >= last_file_block.index {
                file_blocks.push(last_file_block);
                break;
            }

            match (empty_block.length, last_file_block.length) {
                (elen, flen) if elen >= flen => {
                    let new_file_block = FileBlock {
                        id: last_file_block.id,
                        length: flen,
                        index: empty_block.index,
                    };

                    new_file_blocks.push(new_file_block);

                    empty_block.length -= flen;
                    empty_block.index += flen;
                }
                (elen, flen) if elen < flen => {
                    let new_file_block = FileBlock {
                        id: last_file_block.id,
                        length: elen,
                        index: empty_block.index,
                    };

                    empty_block.length = 0;

                    last_file_block.length -= elen;

                    file_blocks.push(last_file_block);
                    new_file_blocks.push(new_file_block);
                }
                (_, _) => panic!(),
            }
        }
    }

    file_blocks.append(&mut new_file_blocks);
    file_blocks.sort_by(|s, o| s.index.cmp(&o.index));

    let result: usize = file_blocks
        .iter()
        .flat_map(|fb| {
            let from = fb.index;
            let to = fb.index + fb.length;

            (from..to).map(|i| fb.id * i)
        })
        .sum();

    println!("{}", result);

    Ok(())
}

#[derive(Debug)]
struct FileBlock {
    id: usize,
    length: usize,
    index: usize,
}

#[derive(Debug)]
struct EmptyBlock {
    length: usize,
    index: usize,
}
```

# Part B

## The Twist

We have the same task, but we need to keep files together for cache efficiency.

## How we Adapt

This is actually rather easy.
We make a simplifying changes and a complicating change.

We can simplify our code because we don't care if the file block can't fully fit.
So we can delete that whole match arm.

We now need to look at all the file blocks to see if they fit.
So, we iterate all the file blocks positioned _after_ the empty slot to find a fit.

The rest is much the same.

## Full Solution

```rust
use std::{collections::VecDeque, io};

use anyhow::{Ok, Result};

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut line = String::new();

    stdin.read_line(&mut line)?;

    let line: Vec<_> = line.trim().chars().collect();

    let mut file_blocks = vec![];
    let mut empty_blocks: VecDeque<EmptyBlock> = VecDeque::new();

    let mut index = 0;
    for (id, chunk) in line.chunks(2).enumerate() {
        let file_size = chunk[0] as usize - '0' as usize;

        let file_block = FileBlock {
            id,
            length: file_size,
            index,
        };

        file_blocks.push(file_block);

        index += file_size;

        if chunk.len() <= 1 {
            continue;
        }

        let space_size = chunk[1] as usize - '0' as usize;

        if space_size <= 0 {
            continue;
        }

        let empty_block = EmptyBlock {
            length: space_size,
            index,
        };
        empty_blocks.push_back(empty_block);

        index += space_size
    }

    let mut new_file_blocks = vec![];

    while empty_blocks.len() > 0 {
        let Some(mut empty_block) = empty_blocks.pop_front() else {
            break;
        };

        while empty_block.length > 0 {
            for i in (0..file_blocks.len()).rev() {
                let last_file_block = &mut file_blocks[i];
                if last_file_block.index < empty_block.index {
                    empty_block.length = 0;
                    break;
                }

                match (empty_block.length, last_file_block.length) {
                    (elen, flen) if elen >= flen => {
                        let new_file_block = FileBlock {
                            id: last_file_block.id,
                            length: flen,
                            index: empty_block.index,
                        };

                        new_file_blocks.push(new_file_block);

                        empty_block.length -= flen;
                        empty_block.index += flen;

                        file_blocks.remove(i);

                        break;
                    }
                    (_, _) => (),
                }
            }
        }
    }
    file_blocks.append(&mut new_file_blocks);
    file_blocks.sort_by(|s, o| s.index.cmp(&o.index));

    let result: usize = file_blocks
        .iter()
        .flat_map(|fb| {
            let from = fb.index;
            let to = fb.index + fb.length;

            (from..to).map(|i| fb.id * i)
        })
        .sum();

    println!("{}", result);

    Ok(())
}

#[derive(Debug)]
struct FileBlock {
    id: usize,
    length: usize,
    index: usize,
}

#[derive(Debug)]
struct EmptyBlock {
    length: usize,
    index: usize,
}
```
