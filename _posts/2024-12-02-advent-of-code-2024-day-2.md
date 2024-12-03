---
layout: page
title: Advent of Code 2024 Day 2
author: Austin Jones
---

Today's advent of code starts our very simple.
However, it takes an unexpected zag for part B teaching a good lesson about what parts of a program should stay plastic.

# Part A

## The Problem

Today, we start with a list of "reports".
The goal of the exercise is to determine if the reports show safe or unsafe progress.
Safe or unsafe is determined by the following set of rules:

- increasing or decreasing for the full length of the report
- always changing by a magnitude of at least 1
- always changing by a magnitude of no more than 3

It is our job to analyze and count the safe reports.

## The Solution

The plan for this follows the same basic flow of the famous [Impureim sandwich](https://blog.ploeh.dk/2020/03/02/impureim-sandwich/):

- ingest input and clean it up for processing
- filter out the bad reports
- count what's left
- output the count

Something to note is that we can lean on Rust's more functional side to keep the rules above pretty separable.
This will have the added benefit of making the rules easy to rearrange or change for part B.

Another, Rust API that I find myself wanting in every other language is the [windows](https://doc.rust-lang.org/std/primitive.slice.html#method.windows) API from the slices library.
This API provides an iterator of slices of size `N`; these slices will be all overlapping slices of the data within the container it was called on.
For our purpose, this will provide a very ergonomic way to get change from element to element in the report.


{% highlight rust %}
use anyhow::Result;
use std::io;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut reports = vec![];

    for line in stdin.lines() {
        let line = line.unwrap();

        let report: Vec<_> = line
            .split_whitespace()
            .map(|s| s.parse::<i32>().unwrap())
            .collect();

        reports.push(report);
    }

    let count = reports
        .into_iter()
        .map(|report| {
            report
                .windows(2)
                .map(|arr| arr[0] - arr[1])
                .collect::<Vec<_>>()
        })
        // check for monotonic increase or decrease
        .filter(|diffs| diffs.iter().all(|v| v > &0) || diffs.iter().all(|v| v < &0))
        // no change greater than 3
        .filter(|diffs| diffs.iter().map(|v| v.abs()).max().unwrap() <= 3)
        // no change smaller than 1
        .filter(|diffs| diffs.iter().map(|v| v.abs()).min().unwrap() >= 1)
        .count();

    println!("{}", count);

    Ok(())
}
{% endhighlight %}

And lo, we have a working solution!

# Part B

## The Twist

The Twist today is that there is one bad report allowed.
This twist is very interesting for two deeply related reasons: it changes the problem on an axis I didn't expect and it throws a wrench in how I designed for change.

This problem has 3 main axes:

- the number of rules
- the complexity of rules
- how rules gate success or failure

The first two were well and easily covered; as for the third not so much.
For all the rules they are all taken as go-no-go.
So, these rules will need to be adapted to find a candidate for being eliminated to smooth the data.

## How we Adapt

There were 80 minutes between the commit of part A working and part B working.
So, how do we adapt?
We adapt slowly.

The first big change was changing the "error detection" to "error finder".
So instead of giving thumbs up or down on the existence of an error, I return a list of all the errors in the list.
Like so:

{% highlight rust %}
fn find_error_events(report: &Vec<i32>) -> Vec<usize> {
    let diffs: Vec<(usize, i32)> = report
        .windows(2)
        .enumerate()
        .map(|(i, arr)| (i, arr[0] - arr[1]))
        .collect();

    let pos_count = diffs.iter().filter(|(_, v)| *v > 0).count();
    let neg_count = diffs.iter().filter(|(_, v)| *v < 0).count();

    // do we have more negatives or positives
    let pon = pos_count > neg_count;

    diffs
        .into_iter()
        // find bad values
        .filter(|(_, diff)| {
            let val = diff.abs();
            // less than 1
            val < 1
                // greater than 3
                || val > 3
                // unexpected sign
                || (*diff > 0) != pon
        })
        .map(|(i, _)| i)
        .collect()
}
{% endhighlight %}

But detecting them is only half the battle.
You have to then determine if they are fixable.
The errors all detected through the change happening after that index.
So, the issue can be with the event before or after the diff returned.
Therein, you have to check both sides:

{% highlight rust %}
let event_to_remove = errors[0];

let val = report.remove(event_to_remove);

let errors = find_error_events(&report);

if errors.is_empty() {
    safe_count += 1;
    continue;
}

report.insert(event_to_remove, val);

report.remove(event_to_remove + 1);

let errors = find_error_events(&report);

if errors.is_empty() {
    safe_count += 1;
    continue;
}
{% endhighlight %}

## The full solution

The difference between the needs of part A and B today showed the importance of a key software engineering.
A large part of understanding the problem you are solving is understanding how that part of the problem can grow.
Any good problem will be multifaceted.
The parts of a problem can be related, however it behooves us to find ways to solve them orthogonally.
In this case, the embedding of the error rules in the logic that filters reports made it such that it was hard to make additions to the error handling.
Separating the error detection and the report filtering allowed for the space to fix errors before filtering.

Illusions of "performance gains" could be used as an excuse for why a fast exit with error detection was used in part A.
However, Rust (and many other languages) offer a suite of lazy iterator solutions.
Lazy iterators don't iterate until they are called upon to do so.
Therein, a lazy iterator can be built to detect errors or collect errors depending on how it is called.
In short, try to keep all parts of your solution flexible and orthogonal.

{% highlight rust %}
use anyhow::Result;
use std::io;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut reports = vec![];

    for line in stdin.lines() {
        let line = line.unwrap();

        let report: Vec<_> = line
            .split_whitespace()
            .map(|s| s.parse::<i32>().unwrap())
            .collect();

        reports.push(report);
    }

    let mut safe_count = 0;
    for mut report in reports.into_iter() {
        let errors = find_error_events(&report);

        if 0 == errors.len() {
            safe_count += 1;
            continue;
        }

        let event_to_remove = errors[0];

        let val = report.remove(event_to_remove);

        let errors = find_error_events(&report);

        if errors.is_empty() {
            safe_count += 1;
            continue;
        }

        report.insert(event_to_remove, val);

        report.remove(event_to_remove + 1);

        let errors = find_error_events(&report);

        if errors.is_empty() {
            safe_count += 1;
            continue;
        }
    }

    println!("{}", safe_count);

    Ok(())
}

fn find_error_events(report: &Vec<i32>) -> Vec<usize> {
    let diffs: Vec<(usize, i32)> = report
        .windows(2)
        .enumerate()
        .map(|(i, arr)| (i, arr[0] - arr[1]))
        .collect();

    let pos_count = diffs.iter().filter(|(_, v)| *v > 0).count();
    let neg_count = diffs.iter().filter(|(_, v)| *v < 0).count();

    let pon = pos_count > neg_count;

    diffs
        .into_iter()
        .filter(|(_, diff)| {
            let val = diff.abs();
            val < 1 || val > 3 || (*diff > 0) != pon
        })
        .map(|(i, _)| i)
        .collect()
}
{% endhighlight %}
