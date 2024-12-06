---
layout: page
title: Advent of Code 2024 Day 5
author: Austin Jones
---

[Today's problem](https://adventofcode.com/2024/day/5) has us validating page orderings based on given rules.
This is a day where even part A is non-trivial.
Expect hash sets and the like.
As per use you can find the solutions discussed below on [my github](https://github.com/ajone239/advent_of_code_2024/tree/main/day_5a).

# Part A

## The Problem

There is a manual that needs updating but the pages are out of order.
The input is broken into two parts: page ordering rules and lists of updates.
The page orderings will come as two page numbers; the former must precede the latter in a valid update.
The updates are changes to the pages, and they are valid as long as they follow the orderings set forth.

The goal of the exercise in part A is to find all valid updates.
To validate, we submit the sum of all the middle numbers.

## The Solution

The basic plan is to convert the ordering rules into something that is simple to query into.
Then, we will go through each update and validate the ordering.
Both collections of data are in rather simple formats, so reading and parsing them will be similarly easy.

So to make it easy and simple to determine if a page comes before or after one in question we will use a struct holding two hash sets.
This will make checking for orderings between two pages as simple as `page_ord.before.contains(other)`.

{% highlight rust %}
#[derive(Default, Debug)]
struct PageOrdering {
    before: HashSet<usize>,
    after: HashSet<usize>,
}
{% endhighlight %}

We also need access to all these orderings on the aggregate.

{% highlight rust %}
orderings_map: HashMap<usize, PageOrdering>;
{% endhighlight %}

This leaves us with having to use this data.
We need to ensure that for each page in an update there are no invalid pages preceding or following it.
The basic flow for each page will be:

- grab the page ordering
- get all the values before it
- get all the values after it
- validated these against the ordering

{% highlight rust %}
fn check_update(update: &Vec<usize>, orderings_map: &HashMap<usize, PageOrdering>) -> bool {
    for (i, page) in update.iter().enumerate() {
        let Some(page_ordering) = orderings_map.get(page) else {
            return false;
        };

        let before = &update[..i];
        let after = &update[i..];

        for value in before {
            if page_ordering.after.contains(value) {
                return false;
            }
        }

        for value in after {
            if page_ordering.before.contains(value) {
                return false;
            }
        }
    }

    true
}

{% endhighlight %}

## The Full Solution

{% highlight rust %}
use std::{
    collections::{HashMap, HashSet},
    io, usize,
};

use anyhow::Result;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut orderings: Vec<String> = vec![];
    let mut updates: Vec<String> = vec![];

    let mut oou = true;
    for line in stdin.lines() {
        let line = line?;

        if line.is_empty() {
            oou = false;
            continue;
        }

        if oou {
            orderings.push(line);
        } else {
            updates.push(line)
        }
    }

    let orderings: Vec<(usize, usize)> = orderings
        .into_iter()
        .map(|s| {
            s.split('|')
                .map(|sp| sp.parse::<usize>().unwrap())
                .collect()
        })
        .map(|i: Vec<usize>| (i[0], i[1]))
        .collect();

    let updates: Vec<Vec<usize>> = updates
        .into_iter()
        .map(|s| {
            s.split(',')
                .map(|sp| sp.parse::<usize>().unwrap())
                .collect()
        })
        .collect();

    let mut orderings_map: HashMap<usize, PageOrdering> = HashMap::new();

    for ordering in &orderings {
        let page_before = ordering.0;
        let page_after = ordering.1;

        orderings_map
            .entry(page_before)
            .or_default()
            .after
            .insert(page_after);
        orderings_map
            .entry(page_after)
            .or_default()
            .before
            .insert(page_before);
    }

    let result: usize = updates
        .iter()
        .filter(|update| check_update(&update, &orderings_map))
        .map(|update| update[update.len() / 2])
        .sum();

    println!("{}", result);
    Ok(())
}

#[derive(Default, Debug)]
struct PageOrdering {
    before: HashSet<usize>,
    after: HashSet<usize>,
}

fn check_update(update: &Vec<usize>, orderings_map: &HashMap<usize, PageOrdering>) -> bool {
    let mut seen = HashSet::new();

    for page in update.iter() {
        let Some(page_ordering) = orderings_map.get(page) else {
            return false;
        };

        for value in seen.iter() {
            if page_ordering.after.contains(value) {
                return false;
            }
        }

        seen.insert(*page);
    }

    seen.clear();

    for page in update.iter().rev() {
        let Some(page_ordering) = orderings_map.get(&page) else {
            return false;
        };

        for value in seen.iter() {
            if page_ordering.before.contains(value) {
                return false;
            }
        }

        seen.insert(*page);
    }

    true
}
{% endhighlight %}

# Part B

## The Twist

Our twist today is different to all the ones we've seen up to know.
Instead of counting the valid updates and summing their middle number, we are to find the invalid sequences, fix them, then sum the middle value from the valid sequence.
This twist is new in the way that it extends the problem instead of modifying it's internal aspects.

## How we Adapt

The extension of this problem means we have two changes to make: one simple and one not so.
We need to get all the updates to fix.
And, we need to fix them.

Going from valid to invalid updates is as simple as:

{% highlight rust %}
// From
let valid_updates: Vec<Vec<usize>> = updates
    .into_iter()
    .filter(|update| check_update(&update, &orderings_map))
    .collect()
// To
let invalid_updates: Vec<Vec<usize>> = updates
    .into_iter()
    .filter(|update| !check_update(&update, &orderings_map))
    .collect()
{% endhighlight %}

Fixing them is a little harder.
The idea is to use the ordering rules to construct a valid list.
So, for each page in the invalid update go through the new sequence until you find something it cant go in front of then place it.
Letting my Rust speak better than my English.

{% highlight rust %}
fn reorder_pages(update: &Vec<usize>, orderings_map: &HashMap<usize, PageOrdering>) -> Vec<usize> {
    let mut new_update = vec![];

    for page in update {
        let mut i = 0;

        let page_ordering = orderings_map.get(&page).unwrap();

        while i < new_update.len() {
            let new_page = new_update[i];

            if page_ordering.after.contains(&new_page) {
                break;
            }

            i += 1;
        }

        new_update.insert(i, *page);
    }

    new_update
}
{% endhighlight %}

## Full Solution

{% highlight rust %}
use std::{
    collections::{HashMap, HashSet},
    io, usize,
};

use anyhow::Result;

fn main() -> Result<()> {
    let stdin = io::stdin();

    let mut orderings: Vec<String> = vec![];
    let mut updates: Vec<String> = vec![];

    let mut oou = true;
    for line in stdin.lines() {
        let line = line?;

        if line.is_empty() {
            oou = false;
            continue;
        }

        if oou {
            orderings.push(line);
        } else {
            updates.push(line)
        }
    }

    let orderings: Vec<(usize, usize)> = orderings
        .into_iter()
        .map(|s| {
            s.split('|')
                .map(|sp| sp.parse::<usize>().unwrap())
                .collect()
        })
        .map(|i: Vec<usize>| (i[0], i[1]))
        .collect();

    let updates: Vec<Vec<usize>> = updates
        .into_iter()
        .map(|s| {
            s.split(',')
                .map(|sp| sp.parse::<usize>().unwrap())
                .collect()
        })
        .collect();

    let mut orderings_map: HashMap<usize, PageOrdering> = HashMap::new();

    for ordering in &orderings {
        let page_before = ordering.0;
        let page_after = ordering.1;

        orderings_map
            .entry(page_before)
            .or_default()
            .after
            .insert(page_after);
        orderings_map
            .entry(page_after)
            .or_default()
            .before
            .insert(page_before);
    }

    let fixed_updates: Vec<Vec<usize>> = updates
        .into_iter()
        .filter(|update| !check_update(&update, &orderings_map))
        .map(|update| reorder_pages(&update, &orderings_map))
        .collect();

    let result: usize = fixed_updates
        .into_iter()
        .map(|update| update[update.len() / 2])
        .sum();

    println!("{}", result);

    Ok(())
}

#[derive(Default, Debug)]
struct PageOrdering {
    before: HashSet<usize>,
    after: HashSet<usize>,
}

fn check_update(update: &Vec<usize>, orderings_map: &HashMap<usize, PageOrdering>) -> bool {
    for (i, page) in update.iter().enumerate() {
        let Some(page_ordering) = orderings_map.get(page) else {
            return false;
        };

        let before = &update[..i];
        let after = &update[i..];

        for value in before {
            if page_ordering.after.contains(value) {
                return false;
            }
        }

        for value in after {
            if page_ordering.before.contains(value) {
                return false;
            }
        }
    }

    true
}

fn reorder_pages(update: &Vec<usize>, orderings_map: &HashMap<usize, PageOrdering>) -> Vec<usize> {
    let mut new_update = vec![];

    for page in update {
        let mut i = 0;

        let page_ordering = orderings_map.get(&page).unwrap();

        while i < new_update.len() {
            let new_page = new_update[i];

            if page_ordering.after.contains(&new_page) {
                break;
            }

            i += 1;
        }

        new_update.insert(i, *page);
    }

    new_update
}
{% endhighlight %}
