# Why every note-taking app has the same flaw

*The launch essay for Synapse. Publish the same day the waitlist opens.*

---

I have written down roughly four thousand things in the last two years.
I have read back maybe forty of them.

This is, near as I can tell, the normal ratio. My designer friends all
have the same graveyard: a Notes app with 2,300 entries, an Obsidian vault
that hasn't been opened since March, a Slack channel called
`#dm-to-self` with 600 unread messages *to themselves*. The tools vary.
The outcome is the same. Capture is easy. Capture is almost free. And
every single thing we capture evaporates the second we close the tab.

The story we tell ourselves about this is that we're bad at systems.
That if we just used the right template, or the right folder structure,
or the right atomic-notes methodology, the graveyard would become a
library. Twelve years of productivity content has been written on that
premise. Entire companies have been built on it.

It's wrong. We're not bad at systems. The systems are bad at us.

## Two bad defaults

Every note-taking app on the market is one of two things.

**The first is a manual filing cabinet.** Notion, Obsidian, Roam, Capacities.
These apps ask you to decide, at the moment of capture, where a thought
belongs. What project. What tag. What daily note. They assume you know
the shape of the thought before you've had it. You don't. Nobody does.
Thoughts arrive pre-unsorted, which is the entire reason you wrote them
down instead of just thinking them harder.

**The second is a chronological stream.** Apple Notes, the iOS lock screen
note, the Slack-to-self channel, the ever-expanding Google Doc called
"brain dump." These solve the capture problem by refusing to engage with
the organization problem. You get a river. You can put anything into it,
which is great. You can never find anything in it again, which is the
river's fault, not yours.

Both defaults fail at the same moment: the moment between *"I had an
idea"* and *"I did something with it."* Manual systems lose you to
decision fatigue before the idea is even logged. Streams lose you to
archaeology a week later. The idea was always there. It just never
became anything.

## What's actually missing

The thing missing from every one of these tools is the part that the
human is doing for free right now, poorly, in their head: routing.

When I capture a voice memo that says "Heron wants me to pick one
medium," a part of my brain instantly knows this is about the thesis,
it's about a decision I've been postponing, and it's about a meeting I
had two Thursdays ago. All three of those facts are obvious to me in the
instant of capture. None of them are written down. And six days later,
the voice memo is still sitting there, untagged, out of context, slowly
turning into noise.

The problem is not that I forgot to file it. The problem is that filing
is the wrong metaphor. Files are for things you already know the shape
of. Thoughts are the opposite of that.

## What Synapse does differently

I've been building Synapse for the last few weeks to answer exactly one
question: *what does it feel like if capture stays free, but organization
becomes automatic?*

The product is simple enough to describe in one sentence. You throw
thoughts in — text, voice, links, images, whatever — and they
auto-cluster into the shape of your week, with a visible reason for why
each one landed where it did, and a single suggested next step that turns
each cluster from "a pile" into "a commitment."

Three things follow from that, all of which are design decisions I'm
willing to defend.

**Capture is one surface.** Not four tabs, not four modalities in four
apps. One bar that accepts everything. Hit `⌘K` from anywhere, type,
paste, dictate, drop an image. Ten seconds total. Zero filing decisions.

**Every routing decision is inspectable.** Hover any capture and it tells
you *why* the system put it where it did: "People entity (@mayakmakes)
+ collaboration intent." You do not have to trust the routing. You can
audit it. This is the single most important design move in the product.
A black box that decides where your thoughts go is, reasonably, a thing
you will not use.

**Every cluster rolls up into a commitment, not a summary.** The
Suggested Next Step is not "here's what you wrote about this week."
That's a summary, and summaries are the reason second-brain tools fail.
The next step is an instruction: *"Finalize the Lumen moodboard by
Thursday EOD. Block 2h Thursday morning now, before the week fills."*
Accept, tweak, or ignore. The default button ships it to Tasks.

## The bet

The bet Synapse is making is that the capture-to-action gap is where
every note-taking tool has been losing its users, and that closing it
requires giving up some control the tools were weirdly insistent on
keeping. No tag picker. No folder structure. No daily note template.
No graph you have to cultivate. The product decides. You inspect. You
ship.

If you've been running your week through a pile of notes that never
become anything, I'd like you to try it.

**Waitlist: synapse.so/waitlist.** First hundred spots are free. After
that, position jumps every time you share.

The first TikTok goes up Thursday. The Map view video. You'll know it
when you see it.

— Mira / Ambady

---

*Synapse is a prototype I built as a design-research exercise. It's not
a company yet. Whether it becomes one depends a lot on what the first
few hundred of you do with it. No pressure. Go read a different essay
if this one didn't land.*
