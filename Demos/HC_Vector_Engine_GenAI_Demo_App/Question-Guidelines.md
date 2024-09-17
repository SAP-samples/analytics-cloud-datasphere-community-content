# Guidelines for Vector Store Demo Questions

How to pick the **right questions** and how to ask the **question right**.

_This is just a guideline from an engineering perspective. Change the content according to the audience's needs._

These guidelines focus on the movie dataset, and might not be applicable to other datasets.
We experienced many questions to result in unexpected outcome. While this has multiple reasons, we collected these guidelines to support to phrase the questions right.

## Summary

Please take the time to read the points we

 * Aim for a specific movie from 2022 or newer
 * Use the Expert mode (ensure the sorting is "Cosine Similariy descending"), that your question finds the selected movie in the Top 3
 * Explicitely specify aspects of the plot or characters within the question
 * Avoid generic question which require knowledge about personal preferences or transfer to other contextes. The application is not designed to ask back. Every request is independant from each other.
 * Be aware of the audience. The results of the example questions or the selected movies might not suite the audience.
 * WOW! Show advantage of Vectorstore by beeing unprecise in the question:
   * Write written number instead of digits (twenty eight instead of 28)
   * Write the question in a different language (e.g. "achtundzwanzig Tage" instead of "28 Days")
   * Geographically unprecise (e.g. "Italy" instead of "Venice")

## General processing workflow

The demo does the following simple steps when processing a RAG request.
From this approach and qualitie of vectors, the rules guidelines are derived.

1. The question is translated to a vector

This process is **deterministic**. I.e. same question results in same vector.

2. The top 5 most similar movies as added to context

It will always be 5 (there might be limitation, when using other models, then it might be 3),
independant from the actual score.

I.e. If there is only a single good score, it will still take all 5 movies. And vice versa, if all movies score bad, it will still take them.

Therefore: Ensure, that the movies you are aiming are in the Top 3!

3. Send Question and Context to LLM

This is **indeterministic**. I.e. same quesiton might result in different answers

## Tooling

_The expert mode proved a very fast search of fitting movies for a question. Consider it as "debug" tool or "developer mode". Use it!_

 * **Ensure the table is sorting correctly** (Similary descending order)
 * The targeted movie must be on TOP 5, otherwise not considered in RAG
   * GPT3.5 only supports less context, so rather aim for Top 3
 * Use the Movie Browser
 * Compare RAG and No-RAG:
   * Just if a sementic search and question sounds promissing, it doesn't mean, that it a well suited.
 * Get an overview of "new" movies:
   * [Movies 2022](./data_retrieval/movies/movie_summaries/movie_summary_2022.md)
   * [Movies 2023](./data_retrieval/movies/movie_summaries/movie_summary_2023.md)
   * [Movies 2024](./data_retrieval/movies/movie_summaries/movie_summary_2024.md)

_These lists of movies were created by applying an LLM to the Wikipedia pages and extracting director, genre and brief summary._


## Question design - How to phrase the question right

**IMPORTANT: Use one shot questions only!!!**

Ask questions, which can be answered with a single database lookup and LLM call.

I.e. this is no chat. The Application cannot ask back for further specification. So don't put implicit aspects in the questions.

This implies: Avoid to ask about personal preference!

Non-working Example: "Which movie can I watch with my girlfried?"

 * The personal preferences of you and your girlfriend isn't known and would require to ask back
 * (not part of this rule) The question is unspecific and the semantic search will rather search for movies about girlfriends

How would the process need to look, to answer this question:

 1. Ask back, what your like both
 2. Phrase a hypothetical plot, which would suite that preferences
 3. Create the vector from this hypotherical plot and do semantic search
 4. Send the context and original question plus information retrieved in step 1 to LLM

We don't implement step 1 and 2! And therefore is our step 4 not suited.

Therefore:

 * Avoid questions which contain personal preferences, where a peer in a chat would have to ask back.
 * Avoid Multi Layer questions, where the question has to be processed (multiple times) to suite a semantic search
 * Avoid implicity

**Aim for 1 (max 3) movie**

Don't ask too general, i.e. the question applies to hundrets of movies.
So avoid: "What is you favourite alien species from movies?"

This is problematic, because:
 * It is not aiming specific movies
 * The resulting semantic search might pick "Species", which is a Horror movie
   * The semantic search could basically pick any movie and the likelyhood, that the Top 5 are not suited for the question is high
 * The context given in RAG might eben confuse the LLM
 * The LLM can answer it without context, because it is a very general question
 * (not part of this rule) It asked about personal preferences and is therefore not a one-shot question

Therefore:

 * Make use of Expert Mode and check, which movies are selected!

**Aim for new movies**

The LLM was trained with data until October 2021. I.e. It might know about movies before that.
Therefore aim for movies released in 2022 or later!

This is more likely to win the RAG vs. No-RAG comparison.

**Question about plots**

The vectors only contain information about the movie title and the plot.
Therefore ask qustions, which focus on the plot of a single or multiple movie. However, "multiple" should be 3 or less!

Characters are also part of a plot, but not the actors. I.e. The vector "knows" that Ken is the boyfriend of Barbie, but the vector doesn't know, that it is played by Ryan Gosling.

This however makes it interesting for a database of a series. Imagine we had the plot of all Simpsons episode.
Then we would rather ask "In which episode travel the Simposons to Italy?"

**Avoid Meta question about movies**

Since only the plot is in the vector, question aiming the following topics cannot be answered:

 * Crew behind the scene, e.f. director, camera, actors, producer, studio, etc.
 * Revenue
 * Critics, Oscars and social impact
 * Genre, screenplay and atmosphere
    * It might derive the genre from the plot information, but I guess this is not generally true
 * etc.

However: The context send to the LLM contains the release date. So questions with "recent" "newest" etc. are possible, _as long as_ the aimed movie is part of the context (i.e. Top 5)

Therefore:

 * Focus on the plot or characters

**Specify further already in the question. Be explicit**

Give the semantic search hints to look for. E.g. by naming characters or ask about parts of the plot.

Instead of a general question specify the movie and the Characters in it. Be explicit.
Consider the vector search as search for multiple words via a single search AND the words don't need to be the same, as long as they are semantically related.

E.g.:

 * "Who could I fall in love with?" convert to "I so like Gloreth and Ballister from the Nimona movie. I wonder with who I can call in live with."


**Name the movie or a significant characteristic of the plot/main character**

The aimed movie must be directly clear from the question.
Either by naming it directly. "What ... in the XXX movie?"

Or indirectly, by using the significant character. Such as "What does Indiana Jones ..."

**Change wording from plot to semantic similar words. Adding the Wow!**

This doesn't make the search result better, but more impressive, since you can search for "Italy" and find plots with "Venice".
This is something a fuzzy search on words cannot do. This is one of the main feature of vector search.

E.g.

 * "Does Indiana Jones ever travel to italy?"
   * The plot of third Indiana Jones (The Last Crusade) doesn't contain the word "Italy", but "Venice", a town in Italy
   * The Vector search rates this movie best and the LLM answers with "Yes, ... travels to Venice, Italy. ..."
 * "twenty eight"
   * Will list "28 weeks later" and "28 days"
 * "achtundzwanzig Tage" (German: "twenty eight days")

_Note:_ The movie "Indiana Jones and the Last Crusade" is from 1989, so the LLM should know it anyway. However, when I clicked "No RAG", it answered "No". The LLM doesn't seem to know one of the best movies ever made.

_Note:_ "28 Days" is a movie about a woman (plays by Sandra Bullock) beeing alcoholic. And "28 Days/Weeks later" is about a Zombie apocalypse. These movies might not fit the requirements of a demo showcase.

## General rules for Presentation

_General rules to make a question appropriate for a presentation:_

Easy to understand:
 * Make it short
 * Easy to read out loud!
 * Don't require knowledge about a specific movie
 * RAG and No-RAG answers shall **look different** on first sight!
   * Both answers are short
   * No-RAG answer is short, RAG answer is long
   * RAG answer starts with "Yes" or similar signal word, whole No-RAG starts with something as "As an AI I don't have ..."

Light hearted:

Avoid controversial topics, such as:
 * War
 * Questionable boudaries/political conflicts (e.g. Annection of Krim)
 * Social norms (Movies tend to be modern and therefore play with sexuality, ethnics, etc.)

Consider various classes of questions:

 * Compare 2 movie plots or characters
 * Specific question about a movie
 * Specific question about a movie series
 * Invent something now based on something given
 * General search for movies in te database (that question should still be very specific)
 * Analytical task for a movie (the analytical task shall not be too long, to still find the movie via semantic search)


## Examples

The examples are "working" or "nor working" from the aspect:
 * Are the answers significant and visually different
 * Does the answer contain information about new movies

Furthermore we try to reason, why this question is or is not working.
However, be aware, that these are mostly assumptions and might not be applicable in a general way.

"Non-Working" can still be a good question! But the workflow of the app isn't able to process the question sufficiently.

### Working examples

**Are there any new characters introduced in the latest Barbie movie?**

 * Aims at a new movie, which is also ranked highest in the search
 * Has analytical character, which can be directly translated to a task by LLM

**Show me a movie with the most uplifting underdog story about sports.**

We added "about sports" to:
 * Prevent an upliftung story about controvesial topic like war
 * Get "The Underdoggs" movie, which is a sports movie

**Compare the plots of the two Super Mario Movies**

The NO-RAG version doesn't know about the second Super Mario Movie, so compared to RAG, they look different immediately.

**From the movie Rebel Moon. Who will be the best roommate? Atticus, Kora or Gunnar?**

Working, because it ranks Rebel Moon as best fit.
 * "movie Rebel Moon" in question
 * Character names are mentioned
The answers look different in both cases.
The RAG answer gives a strcutured response, which is also impressive.

_Note:_ You could consider remove "Atticus", since he is the ewil guy. Or change the order to "Gunnar, Kora or Atticus?" so Gunnar, a very positive character, is mentioned first.

**In which movie travels Indiana Jones to Greece?**

 * Part of a well known series.
 * Question and aswer is not spoiling content.
 * Indiana travels only in the latest movie (Dial of Destiny form 2023) to Greece, so NO-RAG cannot answer the question.
 * Both answers are very short and start with "No" resp. "Yes"
 * The question is about a plot detail.

_Note:_  **Does Indiana Jones ever travel to italy?** works also fine, while the respective movie is from 1989, the LLM answered the question correctly only, when RAG is set. The interesting part to show here: The word "Italy" doesn't appear in the plot, but the word "Venice". 

**Name the side characters in the selected movies. Explain how they relate to the main character. Order the listing alphabetically. Add the title of the movie in brackets after the side characters name.**

 * Analytical task is clear
 * The semantic search still finds Barbie (but the similarity is not that good)

### Non-working examples

**What movies are about Ferrari?**

While the RAG answer lists a new movie, compared to the No-RAG answer, the new movie is not emphasized in the answer. Both answers look visually similar compared to size and structure. The difference is only visible, if you read and remember both examples.

**Suggest some sci-fi movies to watch over the weekend**

 * The "vector" doesn't know, that the plots are fiction nor does it know the genre
 * The weekend is unrelated to the movie. So it might search for movies about weekend
 * It is not a one-shot question: In a chat situation, the peer would ask to specify more
 

**Which movie character would make the best roommate, and why?**

 * Not a one-shot question: The peer would need to ask about properties of the best roomate
 * It will rather search for movies about roomates
 * Doesn't aim at a specific list of movies
 * Above is a variant of the question, but phrased at one-shot question

**Show me a movie with the most adorable animal sidekick**

Such a nice question, but the result doesn't list any Disney movie.

 * The plot of a movie usually doesn't contain, if a sidekick is adorable
 * Doesn't find any new movies
 * (Assumption) Sidekicks might not be so relevant in the plot and therefore have less impact on vectors

