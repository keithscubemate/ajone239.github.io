---
layout: page
title: Advent of Code 2024 Day 4
author: Austin Jones
---

[Today's problem](https://adventofcode.com/2024/day/4) entails a word search.
With the season's theme, we're to search the word `XMAS` in any orientation.
It will work out to be a cool use of masks.
My code is below, however you can also go [here](https://github.com/ajone239/advent_of_code_2024/tree/main/day_4a).

# Part A

## The Problem

As described above, we find the word in `XMAS` in a word search in any orientation.
To be ready for changes in part b, we will grab words out of the search before we check them for matching.

## The Solution

So, we need a procedural way to check for words in the puzzle.
A first pass would be to check all the cardinal directions: e.g.

{% highlight rust %}
    /* The shape of the mask made in our checks
     *  *  *  *
     *   * * *
     *    ***
     *  *******
     *    ***
     *   * * *
     *  *  *  *
     */
{% endhighlight %}

But with if we check the word back and forth we only need this mask represented thusly.

{% highlight rust %}
    /* The shape of the mask made in our checks
     *
     *     ****
     *    ***
     *   * * *
     *  *  *  *
     */
    let directions = [(0, 1), (1, 0), (-1, 1), (1, 1)];
{% endhighlight %}

This is used fully like so:

{% highlight rust %}
use std::io;

use anyhow::Result;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut puzzle: Vec<Vec<char>> = vec![];

    for line in stdin.lines() {
        let line = line?;

        let row = line.chars().collect();

        puzzle.push(row);
    }

    /* The shape of the mask made in our checks
     *
     *     ****
     *    ***
     *   * * *
     *  *  *  *
     */
    let directions = [(0, 1), (1, 0), (-1, 1), (1, 1)];

    let cross_word = CrossWord::new(puzzle);

    let mut count = 0;

    for i in 0..cross_word.length {
        for j in 0..cross_word.width {
            for dir in directions {
                let i = i as isize;
                let j = j as isize;

                let word: String = (0..4)
                    .map(|k| (i + k * dir.0, j + k * dir.1))
                    .map(|(i, j)| cross_word.bounded_at(i, j))
                    .filter(|c| c.is_some())
                    .map(|c| c.unwrap())
                    .collect();

                if word == "XMAS" || word == "SAMX" {
                    count += 1;
                }
            }
        }
    }

    println!("{}", count);

    Ok(())
}

struct CrossWord {
    length: usize,
    width: usize,
    puzzle: Vec<Vec<char>>,
}

impl CrossWord {
    fn new(puzzle: Vec<Vec<char>>) -> Self {
        let length = puzzle.len();
        let width = puzzle[0].len();

        Self {
            length,
            width,
            puzzle,
        }
    }

    fn bounded_at(&self, i: isize, j: isize) -> Option<char> {
        if i < 0 || j < 0 || i >= self.length as isize || j >= self.width as isize {
            return None;
        }

        let i = i as usize;
        let j = j as usize;

        Some(self.puzzle[i][j])
    }
}
{% endhighlight %}

# Part B

## The Twist

We go from looking for `XMAS` to X-MAS's, e.g.:

```
M M
 A
S S

M S
 A
M S
```

## How we Adapt

The plan is to change the mask shape to this:

```
* *
 *
* *
```

{% highlight rust %}
    /* The shape of the mask made in our checks
     *
     *  *
     *   *
     *    *
     */
    let criss = [(-1, -1), (0, 0), (1, 1)];

    /* The shape of the mask made in our checks
     *
     *    *
     *   *
     *  *
     */
    let cross = [(-1, 1), (0, 0), (1, -1)];
{% endhighlight %}

This new mask will make two strings both of which should be `MAS`.

{% highlight rust %}
// Could be an local function tho
let dir_to_word = |dirs: &[(isize, isize)]| -> String {
    dirs.iter()
        .map(|dir| (i + dir.0, j + dir.1))
        .map(|(i, j)| cross_word.bounded_at(i, j))
        .filter(|c| c.is_some())
        .map(|c| c.unwrap())
        .collect()
};

let word_criss: String = dir_to_word(&criss);

let word_cross: String = dir_to_word(&cross);

if (word_cross == "MAS" || word_cross == "SAM")
    && (word_criss == "MAS" || word_criss == "SAM")
{
    count += 1;
}
{% endhighlight %}

## Full solution

{% highlight rust %}
use std::io;

use anyhow::Result;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut puzzle: Vec<Vec<char>> = vec![];

    for line in stdin.lines() {
        let line = line?;

        let row = line.chars().collect();

        puzzle.push(row);
    }

    /* The shape of the mask made in our checks
     *
     *  *
     *   *
     *    *
     */
    let criss = [(-1, -1), (0, 0), (1, 1)];

    /* The shape of the mask made in our checks
     *
     *    *
     *   *
     *  *
     */
    let cross = [(-1, 1), (0, 0), (1, -1)];

    let cross_word = CrossWord::new(puzzle);

    let mut count = 0;

    for i in 0..cross_word.length {
        for j in 0..cross_word.width {
            let i = i as isize;
            let j = j as isize;

            // Could be an local function tho
            let dir_to_word = |dirs: &[(isize, isize)]| -> String {
                dirs.iter()
                    .map(|dir| (i + dir.0, j + dir.1))
                    .map(|(i, j)| cross_word.bounded_at(i, j))
                    .filter(|c| c.is_some())
                    .map(|c| c.unwrap())
                    .collect()
            };

            let word_criss: String = dir_to_word(&criss);

            let word_cross: String = dir_to_word(&cross);

            if (word_cross == "MAS" || word_cross == "SAM")
                && (word_criss == "MAS" || word_criss == "SAM")
            {
                count += 1;
            }
        }
    }

    println!("{}", count);

    Ok(())
}

struct CrossWord {
    length: usize,
    width: usize,
    puzzle: Vec<Vec<char>>,
}

impl CrossWord {
    fn new(puzzle: Vec<Vec<char>>) -> Self {
        let length = puzzle.len();
        let width = puzzle[0].len();

        Self {
            length,
            width,
            puzzle,
        }
    }

    fn bounded_at(&self, i: isize, j: isize) -> Option<char> {
        if i < 0 || j < 0 || i >= self.length as isize || j >= self.width as isize {
            return None;
        }

        let i = i as usize;
        let j = j as usize;

        Some(self.puzzle[i][j])
    }
}
{% endhighlight %}
