---
layout: page
title: Advent of Code 2024 Day 3
author: Austin Jones
---

Today's advent of code is a nice puzzle of parsing and evaluating.
As dealing in languages, it's every programmers love to write a smidgen of a scripting engine.
We see today how a bit of prep and planning can pay back in spades.

# Part A

## The Problem

Today, we're given a program to run.
This program is a script that is corrupted.
It is our job to interpret and run the program.

It is a rather simple program, however.
The program is made up of many `mul` instructions.
These can be expected in the form `mux(X,Y)` where `X` and `Y` can be a 3 digit number.
Any text outside of this form will yield nothing.

The result of our program will be the sum of all these multiplications.

## The Solution

The highest level of the solution will follow: read, parse, compute, print.
Off the heels of yesterday, it is worth taking the time to consider this problem and each portion of it.
Keeping each section of the program well separated will serve us well in Part B.

The reading in this case is rather simple and easy this go round.
The input is a single line.
Reading it in and passing it to a parser will be simple enough.
Printing will be similarly easy.

Parsing will be the interesting part of the design.
It would behoove us to have a flexible way of identifying sections of the input to parse.
It would also be nice to have this way of finding parseable sections to be easily updatable.
It should be tolerant to new types of commands, nesting, or most likely a widening of format.
For parsing I generally think of two things: regex and character matching automata (never mind that they are the same thing; one I have to implement by hand).

The automata solution will have to be done by hand, but will also have the added benefit of handling custom parsing logic.
That's to say, if commands become nested, it will be very easy to parse recursively.
However, supporting new commands in the automata will be rigid to rewrite.

Using a regex to find properly formatted strings then parsing them into structures should be flexible enough.
The regex can be reconfigured for new commands or a widened formats.
For nested commands, the regex will find commands with anything as args then parse the args down.

Computing will be a matter of defining resolution functions for the structures we parse the data into.
The result of all this can be summed into our final result.

{% highlight rust %}
use std::io;

use anyhow::Result;
use regex::Regex;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let input: String = stdin.lines().map(|l| l.unwrap()).collect();

    let re = Regex::new(r"mul\((\d{1,3}),(\d{1,3})\)")?;

    let matches = re.captures_iter(&input);

    let mut commands = vec![];
    for m in matches {
        let left: u32 = m[1].parse()?;
        let right: u32 = m[2].parse()?;

        let command = MulCommand { left, right };
        commands.push(command);
    }

    let result: i32 = commands.iter().map(|c| c.evaluate()).sum();

    println!("{}", result);

    Ok(())
}

trait Evaluate {
    fn evaluate(&self) -> i32;
}

#[derive(Debug)]
struct MulCommand {
    left: u32,
    right: u32,
}

impl Evaluate for MulCommand {
    fn evaluate(&self) -> i32 {
        (self.left * self.right) as i32
    }
}
{% endhighlight %}

This was relatively painless.
A small tip with big dividends: program small.
I tested this after each minor element was written and the full piece worked first try!

# Part B

## The Twist

The twist today is the addition of `do()` and `don't()` commands.
Naturally, `do()` enables processing and `don't()` disables it.
When processing is disabled the multiplications should not be summed into the result.

## How we Adapt

Thankfully, we are light on our toes today.

To adapt, we will expand the regex to catch the two new commands:
{% highlight regex%}
(do|don't|mul)\(((\d{1,3}),(\d{1,3}))?\)
{% endhighlight %}

We will also add a bit of logic to the parsing loop to handle them properly:
{% highlight rust %}
match &m[1] {
    "do" => {
        enable = true;
        continue;
    }
    "don't" => {
        enable = false;
        continue;
    }
    _ => (),
}
{% endhighlight %}

## The full solution

{% highlight rust %}
use std::io;

use anyhow::Result;
use regex::Regex;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let input: String = stdin.lines().map(|l| l.unwrap()).collect();

    let re = Regex::new(r"(do|don't|mul)\(((\d{1,3}),(\d{1,3}))?\)")?;

    let matches = re.captures_iter(&input);

    let mut enable = true;
    let mut commands = vec![];

    for m in matches {
        match &m[1] {
            "do" => {
                enable = true;
                continue;
            }
            "don't" => {
                enable = false;
                continue;
            }
            _ => (),
        }

        if !enable {
            continue;
        }

        let left: u32 = m[3].parse()?;
        let right: u32 = m[4].parse()?;

        let command = MulCommand { left, right };
        commands.push(command);
    }

    let result: i32 = commands.iter().map(|c| c.evaluate()).sum();

    println!("{}", result);

    Ok(())
}

trait Evaluate {
    fn evaluate(&self) -> i32;
}

#[derive(Debug)]
struct MulCommand {
    left: u32,
    right: u32,
}

impl Evaluate for MulCommand {
    fn evaluate(&self) -> i32 {
        (self.left * self.right) as i32
    }
}
{% endhighlight %}
