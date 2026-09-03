export interface ListeningExercise {
  id: string;
  title: string;
  cefrLevel: string;
  audioUrl: string;
  speakerNativeAccent: string;
  transcriptText: string;
  questions: {
    id: string;
    questionText: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface SpeakingExercise {
  id: string;
  title: string;
  targetPhrase: string;
  phoneticGuide: string;
  englishTranslation: string;
  audioSampleUrl: string;
  aiModelUsed: string;
}

export interface ReadingExercise {
  id: string;
  title: string;
  passageTitle: string;
  passageText: string;
  vocabularyNotes: { word: string; translation: string; grammarNote: string }[];
  questions: {
    id: string;
    questionText: string;
    options: string[];
    correctIndex: number;
  }[];
}

export interface WritingExercise {
  id: string;
  title: string;
  promptText: string;
  minWordCount: number;
  virtualKeyboardKeys: string[];
  sampleSolution: string;
}

export const mockLsrwData = {
  listening: [
    {
      id: "list-01",
      title: "Audio Drill 1: Native French Greetings & Ordering at a Bistro",
      cefrLevel: "A1.1",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      speakerNativeAccent: "Metropolitan French (Paris, France)",
      transcriptText: "Bonjour Monsieur! Un café s'il vous plaît. Et pour vous Madame? Une eau minérale, merci.",
      questions: [
        {
          id: "lq-1",
          questionText: "What drink did the lady order?",
          options: ["Un café", "Une eau minérale", "Un thé", "Un jus d'orange"],
          correctIndex: 1
        },
        {
          id: "lq-2",
          questionText: "Which polite greeting phrase was used?",
          options: ["Au revoir", "Bonjour Monsieur", "Salut", "Bonne nuit"],
          correctIndex: 1
        }
      ]
    }
  ] as ListeningExercise[],

  speaking: [
    {
      id: "spk-01",
      title: "Pronunciation Drill 1: Self Introduction in French",
      targetPhrase: "Bonjour, je m'appelle Arun et je suis étudiant.",
      phoneticGuide: "[bon-zhoor, zhuh mah-pel A-roon ay zhuh swee ay-too-dee-ahn]",
      englishTranslation: "Hello, my name is Arun and I am a student.",
      audioSampleUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      aiModelUsed: "Python FastAPI Whisper STT (Speech-to-Text) Pronunciation Model"
    },
    {
      id: "spk-02",
      title: "Pronunciation Drill 2: Ordering Coffee & Polite Expressions",
      targetPhrase: "Un café au lait et un croissant, s'il vous plaît.",
      phoneticGuide: "[uhn kah-fay oh lay ay uhn krwah-sahn, seel voo play]",
      englishTranslation: "A coffee with milk and a croissant, please.",
      audioSampleUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      aiModelUsed: "Python FastAPI Whisper STT (Speech-to-Text) Pronunciation Model"
    }
  ] as SpeakingExercise[],

  reading: [
    {
      id: "rdg-01",
      title: "Reading Comprehension 1: A Letter from Paris (Une Lettre de Paris)",
      passageTitle: "Chers Amis,",
      passageText: "Je suis à Paris. La ville est magnifique! Le matin, je prends un croissant dans un petit café près de la Tour Eiffel. L'après-midi, je visite le musée du Louvre. J'aime beaucoup la langue française!",
      vocabularyNotes: [
        { word: "magnifique", translation: "magnificent / beautiful", grammarNote: "Adjective describing feminine singular noun (La ville)" },
        { word: "près de", translation: "near to / close to", grammarNote: "Prepositional phrase requiring 'de'" },
        { word: "musée", translation: "museum", grammarNote: "Masculine noun (le musée)" }
      ],
      questions: [
        {
          id: "rq-1",
          questionText: "Where is the author located?",
          options: ["À Lyon", "À Paris", "À Marseille", "À Bordeaux"],
          correctIndex: 1
        },
        {
          id: "rq-2",
          questionText: "What museum does the author visit in the afternoon?",
          options: ["Musée d'Orsay", "Musée Rodin", "Musée du Louvre", "Centre Pompidou"],
          correctIndex: 2
        }
      ]
    }
  ] as ReadingExercise[],

  writing: [
    {
      id: "wrt-01",
      title: "Writing Composition 1: Introduce Yourself in French (Présentez-vous)",
      promptText: "Write a short paragraph in French (minimum 30 words) introducing yourself. State your name, nationality, profession, and favorite hobbies. Use the virtual accent keyboard below for special characters.",
      minWordCount: 30,
      virtualKeyboardKeys: ["é", "è", "à", "ç", "œ", "ê", "ù", "â", "î", "ô", "É", "È", "À", "Ç"],
      sampleSolution: "Bonjour! Je m'appelle Arun. Je suis étudiant à l'université. J'habite à Chennai. J'aime écouter de la musique française et voyager. Enchanté!"
    }
  ] as WritingExercise[]
};
