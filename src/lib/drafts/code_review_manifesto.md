---
title: Code Review Manifesto
author: Austin Jones
date: "2025-07-11"
excerpt: "
Code reviews are a great platform for us as devs to become more familiar and cohesive.
I think it is a little bit of process for huge team gains.
It will take initial work and annoyance.
However, working to define our process, taking the time to see how each of us do things, and using it as grounds to better collaborate will make us a better team.
"
---

So, the question I intend to answer is: "What is my vision for how code reviews work?".

To get into it, I think a code review has 3 parts: inputs, process, and outputs.
I think it's less important that we follow a prescribed code review process and more important that we get the outputs from it.
I also believe that good in = good out, so I also want to consider how we can well shape our inputs to help ourselves out.
As Stuart and I spoke about the other day, I view programming as functions that transform inputs into outputs; this will be our process.

Starting at the end, what are the outputs (benefits) that code reviews can and should supply? The outputs to me exist in three categories tracking, iterative improvement, and standards.

- So, if and when we use PRs or PBI comments or something else we will then gain a log of all the comments and discussions we've had about each other code.
This can be indispensable when we find a bug that we have seen before and can't remember how to solve it.
It is also a natural place to spawn work from.
It can also act as a CYA akin to `git blame`; i.e.
you can show people that they indeed approved the idea they are arguing against.
This can help lessen tempers in a design meeting.
- Iterative improvement for me is 1) a review can be a place to get ideas or develop ideas and 2) knowledge share.
The first allows for someone to work on what they can but then open up a sticking point to the team for discussion.
This lets us all teach and learn from one another as well as pays into the UTUS-SW mindshare.
This also segways into the second point, which is sharing knowledge.
The Monday SW Sync lets me know what Alec is working on, but I don't know anything about his implementation.
From a technical standpoint, I have little to no idea how the firmware or ICL works.
Getting over this siloing is a huge value add of code reviews.
- Standards are a programmer's friend.
I'm sure I could be cast as "particular" about this, but I think there's value in it.
Onerous and unreasonable guidelines make for an annoying process.
However, I do think that an auto formatter and some loose guidelines will steel us as a team.
I also think that we as a team should work to define these ourselves.
This brings me to discuss what I think the "inputs" to this process should be.
These may seem obvious however, code changes, requirements, and a collaborative mindset are tantamount to a good code review process:

- Code changes are needed for a code review, however, care needs to be put into these changes s.t.
they are reviewable.
Changes should be
    - Neat: you are an author of code, so consider your audience.
    - Small: [Big vs. small PR : r/programminghumor](https://www.reddit.com/r/programminghumor/comments/14uzv4w/big_vs_small_pr/)
    - Focused on the requirements: plz don't run a new formatter on 200 files in your simple feature PR.
- Well-focused requirements make for well-focused work.
    So, The tickets that people are working on should set them up for success in the code space.
    Lest you think this is passing the buck, we should be the ones helping ourselves out.
    We can work and iterate on ticket definition in a retro or planning meeting.
    This can also of course be iterated on.

- The CEO of the start-up I worked at would always say, "Remember you all work together." So, when it gets contentious in the PR comments, remember that we are all working to build the same thing.
    Finally, let's discuss the process of reviewing code.
    This is important, but I think there's less to say here that isn't assumed.
    The main benefit I see from some kind of review process is the practice of reviewing your code outside of the head-down space and DevOps goodies.

- Even in our verbally maintained history of UTUS-SW, there are many many stories of one-off gotchas from merging without reviewing what you did.
    This happens from time to time, but it is much harder if you give your work a once-over before it merges.
    Something that is worth adding here, this has value for self and partner reviews.
    Even though Alec doesn't look at my PRs for the Utilities, I still find a fair amount of bugs or malpractices in the review of my code.
    This step mixed with some discipline will help us alot.

- DevOps goodies:
    - Automatic Unit testing
    - Automatic formatting
    - Build process automation
    - Some other things that will make VC investors drool
    - Jokes aside, I think we have alot of headaches to be saved if we have even a thin CI pipeline for our work.

Things for process that I didn't touch on because they should be more team questions:

- PRs vs PBI comments vs Something else?
- PRs blocking merges?

So, those are my thoughts on code reviews and why they are important.
Moreover, I hope I provided the aspects of the practice that I think require attention and the focus I want to apply to them.
Please do let me what you think.
