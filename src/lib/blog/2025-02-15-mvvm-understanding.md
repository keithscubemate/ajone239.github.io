---
title: MVVM understandings
author: Austin Jones
layout: post
date: "2025-02-15"
excerpt: "Some notes on my breakthroughs in undersanding of the MVVM architecture."
---


I have recently started a new job working on dotnet apps.
Through conversations with more experienced, it was made clear that there was an architectural issue with an application that was causing growing pains.
This document is intended to cover the source of those issues and explain the solution.

 <!--more-->

MVVM Misunderstandings
====================

MVVM Basics
--------------------

At the time of writing, I'm very new to WPF, MVVM, and C#.
The most foreign of these is MVVM.
MVVM is a UI architecture that is meant to separate the display logic from the business logic of the application.
The motive here is to decouple code to increase reusability, scalability, and testability.

MVVM stands for "Model-View-View Model".
Though starting with confusion, the order of dependency looks more like:
<!--
[ View ] -> [ View Model ]
[ View Model ] -> [ Model ]
-->
```
+------+     +------------+     +-------+
| View | --> | View Model | --> | Model |
+------+     +------------+     +-------+
```

Briefly put, the components are:

| Layer | Description | Example |
|-:|-|-|
| Model | Represents the "real" parts of your business logic | a person object
| View | Defines the presentation and look of your app | a button on a screen
| View Model | the code that routes data and actions from the View to the Model | binding a button to a command that creates a person |

Conceptually, this is all quite easy to grok; software engineering is nothing if not a discipline of abstraction.
It is in the implementation of these ideas that questions arise:
- Where does the Model stop and the View Model start?
- If my View Model exposes the entirety of my Model, then why have a Model?
- What is presentation logic and what is business logic?
- If all the agency is put into the View Model, then which functions go in the Model?

<!--
[ View ] - Modifies -> [ View Model ]
[ View Model ] - Notifies -> [ View ]
[ View Model ] <- Writes/Reads -> [ Model ]
-->
```
         Notifies
  +--------------------+
  v                    |
+------+  Modifies   +------------+  Writes/Reads    +-------+
| View | ----------> | View Model | <--------------> | Model |
+------+             +------------+                  +-------+
```

The model is the basic data store of the application.
Its job is to surface basic business logic i.e., _only_ functions and data.
It should have no idea of any presentation logic whatsoever.
The things exposed by the Model are used by the View Model to give the presentation layer things to do and see.

The View Model's lot in life is to translate the presentation layer operations to the business layer.
The View Model reads and writes directly into the Model.
The View Model exposes properties for the View to bind off of.
This allows the View to:
- be notified of all changes in the View Model and to display them
- read from or modify exposed properties

The View is the view into the application.
Simple as it may be, the job of the developer is to keep the View solely concerned with presentation logic.

That laid out, some of the questions above have begun to be answered.

- Where does the model stop and the View Model start?

    The Model is the pure data representation of your application's objects; the View Model exposes this data and brokers interaction with it.

- If my View Model exposes the entirety of my Model, then why have a Model?

    The View Model's function is separate from the Model.
    Abstraction requires discipline to not let two pieces of code that do the same thing _become_ the same thing, purely out of convenience.
    Things that operate together should be functionally coupled, not just that same code.

- What is presentation logic and what is business logic?

    Presentation is what you see and interact with as a user.
    The business logic is what controls the interactions afforded to you.

- If all the agency is put into the View Model, then which functions go in the Model?

    The "agency" only _seems_ to be in the View Model.
    The actual "agency" is in the user -- the active agent.
    Most logic seems to fall into the View Model as your business logic rules are often _mirrored_ by presentation rules.
    E.g. a button has to be disabled if the user hasn't met some requirement.

This is all well and good for test/toy apps that amount to WPF `Hello Worlds`.
How would an app interact with "real" data sources: a web service, a database, etc?
Well, this pretty architecture graph gains a new node -- the data service layer.

The Data Service Layer
--------------------

The data service layer (or just "Service Layer") is your app's window to the outside world.
It is how your application will get/put the data it exposes to the users.

This is very simple to say but, when pen comes to paper, it isn't totally clear where this (these) layer(s) should even go.
Does the data service layer live in the Model, modifying and updating it from within?
Does it live in the View Model, fetching Models?
Is it in some separate thread requiring shared data and weird concurrency?

My Misunderstanding
--------------------

There's no shortage of articles on MVVM, but I found a lack of consensus on how to do MVVM.
Many articles I found only partially covered the nuance of using a data service layer.
The following graphs are what I found to be the most common Data Service Layer architectures used.
I find that they are all incomplete or wrong in some capacity.

### Data Service On the View Model
<!--
[ View ] - Modifies -> [ View Model ]
[ View Model ] - Notifies -> [ View ]
[ View Model ] - Saves -> [ Data Service Layer ]
[ Data Service Layer ] - Loads -> [ View Model ]
[ View Model ] <- Writes/Reads -> [ Model ]
-->
```
+------+  Modifies   +---------------+  Saves   +--------------------+
| View | ----------> |               | -------> | Data Service Layer |
+------+             |  View Model   |          +--------------------+
  ^      Notifies    |               |  Loads     |
  +----------------- |               | <----------+
                     +---------------+
                       ^
                       |
                       | Writes/Reads
                       v
                     +---------------+
                     |     Model     |
                     +---------------+
```
In this arch, the Data Service Layer (DSL) is just hung off of the View Model.
When the View Model is instantiated, the data is loaded.
From there, the rest of the data interactions are hand-waved away.
It is obvious _that_ the View Model triggers the data service layer to save, but when?

This architecture also leaves the dev wondering how exactly the Model and data service layer relate to one another.
It is unclear whether the Models live in the DSL or are shepherded back and forth for all loads and saves.

This was my initial attempt at including the Data Service layer in the my app.
This ended up with the View Model morphing into the Data Service Layer.
When the View Model was small -- it was largely fine.
As the app became more complex, growing pains quickly ensued.

### Data Service Under the Model
<!--
[ View ] - Modifies -> [ View Model ]
[ View Model ] - Notifies -> [ View ]
[ View Model ] <- Writes/Reads -> [ Model ]
[ Data Service Layer ] <- Loads/Saves -> [ Model ]
-->
```
                                                                                 Modifies
                                                                    +--------------------------+
                                                                    v                          |
+--------------------+  Loads/Saves    +-------+  Writes/Reads    +------------+  Notifies   +------+
| Data Service Layer | <-------------> | Model | <--------------> | View Model | ----------> | View |
+--------------------+                 +-------+                  +------------+             +------+
```
This architecture tacks the DSL onto the Model, making the Model responsible for loads and saves of its data.
The immediate issue I had with this was hitting an external data connection on every property update.
Sure, caching could help here but this architecture was quickly discarded.

### Data Service Between Model and View Model
<!--
[ View ] - Modifies -> [ View Model ]
[ View Model ] - Notifies -> [ View ]
[ View Model ] <- Writes/Reads -> [ Data Service Layer ]
[ Data Service Layer ] <- Loads/Saves -> [ Model ]
-->
```
         Notifies
  +--------------------+
  v                    |
+------+  Modifies   +------------+  Writes/Reads    +--------------------+  Loads/Saves    +-------+
| View | ----------> | View Model | <--------------> | Data Service Layer | <-------------> | Model |
+------+             +------------+                  +--------------------+                 +-------+
```
Similar to the architecture above, this architecture smacks the DSL awkwardly between the Model and the View Model.
It suffers from the same issue of not making it clear when to read/write/load/save.
A benefit of this architecture worth noting is that it does hint at the good practice of using the DSL to cache Models.
This serves to buffer the workings of the external data layer from the operations of the View Models.
Still, this is incomplete.

The Click
--------------------

<!--
[ View ] - Modifies -> [ View Model ]
[ View Model ] - Notifies -> [ View ]
[ View Model ] <- Writes/Reads -> [ Model ]

[ View Model ] . Put .> [ Saves ]
[ View Model ] . Fetch .> [ Loads ]

[ Data Service Layer ] .- OnChanged .-> [ View Model ]

[ Model ] -- [ Saves ] -> [ Data Service Layer ]
[ Data Service Layer ] -- [ Loads ] -> [ Model ]
[ Data Service Layer ] - Caches -> [ Model ]
-->
```
                                                                                 Caches
                                                                         +------------------------------+
                                                                         |                              |
                                                                         |       Put                    |
                       ..................................................!.................             |
                       :                                                 v                v             |
+------+  Modifies   +------------+  Fetch   +-------+                 +-------+        +-------+     +--------------------+
| View | ----------> |            | .......> | Loads | --------------> | Model | ------ | Saves | --> | Data Service Layer | -+
+------+             |            |          +-------+                 +-------+        +-------+     +--------------------+  !
  ^      Notifies    |            |            ^       Writes/Reads      ^                              |                     !
  +----------------- | View Model | <----------+-------------------------+                              |                     !
                     |            |            |                                                        |                     !
                     |            |            |                                                        |                     !
                     |            |            |                                                        |                     !
                     +------------+            |                                                        |                     !
                       ^                       |                                                        |                     !
                       ! OnChanged             +--------------------------------------------------------+                     !
                       !                                                                                                      !
                       !                                                                                                      !
                       +.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-+
```

Above is the MVVM Model that I created that finally made the use of the data service layer click.
Note that the DSL isn't hung off either solely the Model or View Model but both.
This is because the Data Service Layer has a few jobs in providing data:
- Providing the Models through data loads
- Saving the Models to the data source through saves
- Caching changes to the Models from the external source
- Notifying the View Models about changes to their data
The main insight that clarifies the function of the data service layer is the combined utility of caching and notifying.
In all previous architectures provided, it seemed that the impetus for loading or saving data was all from the application.
That is fine for a contrived app example, but it is hard to make that work with a more reactive application.

The View and View Model interact as always: the View Model proxies the Model data for the View to bind from and modify.
The throuple of the View Model, Model, and Data Service has a few nuanced interactions.

On startup, the View Model asks the Data service layer for whatever is in its cache.
The View Model then loads references to all the cached data needed, wrapping and storing it however it sees fit.
The View Model then operates on this data as it would in the initial, basic MVVM graph given above.
Contrary to the qualification I made above, the impetus to load and save is still, at least partially, in the View Model.
The DSL exposes the ability to load and save data.
When the View Model needs to load new data or save its Models' states, it chooses when.

As mentioned above, the big help from this Model is the idea of caching and notifying.
While the impetus of when to execute loads and saves is kept with the View Model, the DSL tells the View Model when there is new data.
This means the View Model doesn't have to poll anything, keeping the code simple and the UI-thread free to be smooth.

Additionally, the Models go from more sophisticated objects down to the rank of Data Transfer Objects (DTOs).
A DTO is a simple structure, meant for not much more than passing around collections of data.
This keeps them light and easy to use in different layers, as they're not _specific_ to any layer (e.g., they have no opinion about display, persistence, and so on).

This architecture has two main benefits that work toward the goals of reusability, scalability, and testability.
Separating the data service like this keeps the MVVM part of the application pure and simple.
All the odd data-service interactions can be swept under the abstraction rug at that layer.
This ensures that your Models, Views, and View Models only have to do their own simple UI jobs.
The second is that testing and mocking goes from awkward to dead simple.
Instead of mocking packets from a network interface or making sure that a timer fires at the right time, you can simply load your mock data service layer with all your data and run your test.
