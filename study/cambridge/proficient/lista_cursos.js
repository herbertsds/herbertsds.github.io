const lista_cursos = [
    {
        "name": "Ellipsis",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g060-ellipsis"
    },
    {
        "name": "Bank accounts",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l062-bank-accounts"
    },
    {
        "name": "Can you understand?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l069-can-you-understand"
    },
    {
        "name": "Voicemail",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l070-voicemail"
    },
    {
        "name": "Word stress",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p054-word-stress"
    },
    {
        "name": "US or UK pronunciation",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p064-us-or-uk-pronunciation"
    },
    {
        "name": "Intonation",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1p065-intonation"
    },
    {
        "name": "Money matters",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r061-money-matters"
    },
    {
        "name": "Text messages",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r071-text-messages"
    },
    {
        "name": "Communication",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v053-communication"
    },
    {
        "name": "More definitions",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v073-more-definitions"
    },
    {
        "name": "Cover letter",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w074-cover-letter"
    },
    {
        "name": "What's the product?",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l063-what-s-the-product"
    },
    {
        "name": "A restaurant review",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l066-a-restaurant-review"
    },
    {
        "name": "Word stress four syllable words",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2p055-word-stress-four-syllable-words"
    },
    {
        "name": "The world of work",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r067-the-world-of-work"
    },
    {
        "name": "Property for sale",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r068-property-for-sale"
    },
    {
        "name": "Body and health part 2",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v052-body-and-health-part-2"
    },
    {
        "name": "Definitions of formal words",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v072-definitions-of-formal-words"
    },
    {
        "name": "Fronting substitution and ellipsis",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g059-fronting-substitution-and-ellipsis"
    },
    {
        "name": "Body and health part 1",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v051-body-and-health-part-1"
    },
    {
        "name": "Science fiction",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r002-science-fiction"
    },
    {
        "name": "Forensic linguistics",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1r001-forensic-linguistics"
    },
    {
        "name": "Precise words",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2v001-precise-words"
    },
    {
        "name": "Understanding implied meaning",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1l002-understanding-implied-meaning"
    },
    {
        "name": "Which as a relative pronoun",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g002-which-as-a-relative-pronoun"
    },
    {
        "name": "Statements and opinions",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v002-statements-and-opinions"
    },
    {
        "name": "Ethical journalism",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r001-ethical-journalism"
    },
    {
        "name": "Short dialogues",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l001-short-dialogues"
    },
    {
        "name": "Stressed words and meaning",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1s002-stressed-words-and-meaning"
    },
    {
        "name": "Idiomatic language",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1v001-idiomatic-language"
    },
    {
        "name": "Formal and informal writing",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w001-formal-and-informal-writing"
    },
    {
        "name": "Reporting verbs",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1g001-reporting-verbs"
    },
    {
        "name": "Understanding socio-cultural references",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2r002-understanding-socio-cultural-references"
    },
    {
        "name": "Subtle attitudes",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c2l002-subtle-attitudes"
    },
    {
        "name": "Complaining politely and appropriately",
        "link": "https://www.cambridgeenglish.org/learning-english/activities-for-learners/c1w002-complaining-politely-and-appropriately"
    }
]