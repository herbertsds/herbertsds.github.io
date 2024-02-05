const lista_cursos = [
    {
        "name": "Family holiday",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1g055-family-holiday"
    },
    {
        "name": "What a great idea!",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1g057-what-a-great-idea"
    },
    {
        "name": "See and know",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1g059-see-and-know"
    },
    {
        "name": "Actually and actual",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1g060-actually-and-actual"
    },
    {
        "name": "Very, really, or absolutely?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1g087-very-really-or-absolutely"
    },
    {
        "name": "Listening to dialogues",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1l054-listening-to-dialogues"
    },
    {
        "name": "How do you feel?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1l055-how-do-you-feel"
    },
    {
        "name": "Tastes",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1l080-tastes"
    },
    {
        "name": "Amir's adventure",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1l082-amir-s-adventure"
    },
    {
        "name": "Come or calm?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1p065-come-or-calm"
    },
    {
        "name": "Word stress",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1p068-word-stress"
    },
    {
        "name": "More word stress",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1p069-more-word-stress"
    },
    {
        "name": "Arts and media",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v051-arts-and-media"
    },
    {
        "name": "Word Stress in long words",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1p070-word-stress-in-long-words"
    },
    {
        "name": "Don't annoy your little sister",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1p081-don-t-annoy-your-little-sister"
    },
    {
        "name": "How to make a healthy breakfast",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1p083-how-to-make-a-healthy-breakfast"
    },
    {
        "name": "Is or was?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1p086-is-or-was"
    },
    {
        "name": "Describing what you see",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1s052-describing-what-you-see"
    },
    {
        "name": "Making decisions",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1s054-making-decisions"
    },
    {
        "name": "Office equipment",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v051-office-equipment"
    },
    {
        "name": "Body and health",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v052-body-and-health"
    },
    {
        "name": "Travel the world",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v053-travel-the-world"
    },
    {
        "name": "Easily confused words",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v055-easily-confused-words"
    },
    {
        "name": "Words related to money",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v090-words-related-to-money"
    },
    {
        "name": "Verbs related to money",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v091-verbs-related-to-money"
    },
    {
        "name": "At work",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g052-at-work"
    },
    {
        "name": "The Diamond Eagle",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g055-the-diamond-eagle"
    },
    {
        "name": "Cleft sentences",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g058-cleft-sentences"
    },
    {
        "name": "Discourse markers",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g062-discourse-markers"
    },
    {
        "name": "Headers and tails",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g064-headers-and-tails"
    },
    {
        "name": "At work",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g092-at-work"
    },
    {
        "name": "Speaking to the world",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g093-speaking-to-the-world"
    },
    {
        "name": "Burn or bun?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2p066-burn-or-bun"
    },
    {
        "name": "Bold or bald?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2p067-bold-or-bald"
    },
    {
        "name": "Do you hear the difference?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2p084-do-you-hear-the-difference"
    },
    {
        "name": "Stars or stores?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2p085-stars-or-stores"
    },
    {
        "name": "Millionaires and billionaires",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2r051-millionaires-and-billionaires"
    },
    {
        "name": "What did you think of the movie?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2s051-what-did-you-think-of-the-movie"
    },
    {
        "name": "My best friend",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v051-my-best-friend"
    },
    {
        "name": "Take, make, and do",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v052-take-make-and-do"
    },
    {
        "name": "Choosing the correct word",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v053-choosing-the-correct-word"
    },
    {
        "name": "Computer troubles",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v054-computer-troubles"
    },
    {
        "name": "Similar expressions",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v054-similar-expressions"
    },
    {
        "name": "Metals and gases",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v055-metals-and-gases"
    },
    {
        "name": "Eating",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v094-eating"
    },
    {
        "name": "Spoken or written?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2w063-spoken-or-written"
    },
    {
        "name": "Discourse markers",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1g061-discourse-markers"
    },
    {
        "name": "Do or make?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v007b-do-or-make"
    },
    {
        "name": "Quit, quite and quiet",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v003b-quit-quite-and-quiet"
    },
    {
        "name": "Theatre review",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2l003-theatre-review"
    },
    {
        "name": "Discussing a band",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2l005-discussing-a-band"
    },
    {
        "name": "Being an adult",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2r002-being-an-adult"
    },
    {
        "name": "Syllable stress",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2s004-syllable-stress"
    },
    {
        "name": "Learning about archery",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2r005-learning-about-archery"
    },
    {
        "name": "Retail therapy",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2r003-retail-therapy"
    },
    {
        "name": "Discussing new houses in a town",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2l001-discussing-new-houses-in-a-town"
    },
    {
        "name": "Linking words",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1w005-linking-words"
    },
    {
        "name": "An advertisement",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1w001-an-advertisement"
    },
    {
        "name": "Long and short 'i'",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1s005-long-and-short-i"
    },
    {
        "name": "Arranging to meet",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1r001-arranging-to-meet"
    },
    {
        "name": "Communication and technology",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v004-communication-and-technology"
    },
    {
        "name": "Agreeing and disagreeing",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1l002-agreeing-and-disagreeing"
    },
    {
        "name": "Studying at college",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2l002-studying-at-college"
    },
    {
        "name": "Consonant sounds",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2s002-consonant-sounds"
    },
    {
        "name": "Connectors and punctuation",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g003-connectors-and-punctuation"
    },
    {
        "name": "Virtually Anywhere Episode 3",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/val003-virtually-anywhere-episode-3"
    },
    {
        "name": "A phone message",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1l001-a-phone-message"
    },
    {
        "name": "Websites for teens",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1r005-websites-for-teens"
    },
    {
        "name": "Past simple and present perfect",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1g003-past-simple-and-present-perfect"
    },
    {
        "name": "Which adverb?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1v003-which-adverb"
    },
    {
        "name": "Shopping in a department store",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1r002-shopping-in-a-department-store"
    },
    {
        "name": "Full stops and commas",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2w005-full-stops-and-commas"
    },
    {
        "name": "Dependent prepositions",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2g001-dependent-prepositions"
    },
    {
        "name": "Order of events",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2w003-order-of-events"
    },
    {
        "name": "Organising writing",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2w001-organising-writing"
    },
    {
        "name": "Virtually Anywhere Episode 5",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/val005-virtually-anywhere-episode-5"
    },
    {
        "name": "Formal and informal verbs",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2w004-formal-and-informal-verbs"
    },
    {
        "name": "The truth about ballet",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1r004-the-truth-about-ballet"
    },
    {
        "name": "A comic book",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1r003-a-comic-book"
    },
    {
        "name": "Cancelling meetings",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2s004b-cancelling-meetings"
    },
    {
        "name": "Listening for detail",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1l003-listening-for-detail"
    },
    {
        "name": "How to write a formal letter",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2w002a-how-to-write-a-formal-letter"
    },
    {
        "name": "Virtually Anywhere Episode 1",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/val001-virtually-anywhere-episode-1"
    },
    {
        "name": "During, for and since",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v005b-during-for-and-since"
    },
    {
        "name": "Syllable stress",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1s003-syllable-stress"
    },
    {
        "name": "Word families: care",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v007-word-families-care"
    },
    {
        "name": "Virtually Anywhere Episode 6",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/val006-virtually-anywhere-episode-6"
    },
    {
        "name": "Word families: danger",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v008-word-families-danger"
    },
    {
        "name": "Virtually Anywhere Episode 7",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/val007-virtually-anywhere-episode-7"
    },
    {
        "name": "Relative pronouns",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b1g002-relative-pronouns"
    },
    {
        "name": "Word families: break",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v006-word-families-break"
    },
    {
        "name": "Word families: friend",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v005a-word-families-friend"
    },
    {
        "name": "There, it and they",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2v008b-there-it-and-they"
    },
    {
        "name": "How to write an informal email",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/b2w002b-how-to-write-an-informal-email"
    },
    {
        "name": "Virtually Anywhere Episode 2",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/val002-virtually-anywhere-episode-2"
    },
    {
        "name": "Virtually Anywhere Episode 4",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/val004-virtually-anywhere-episode-4"
    }
]