import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, GroundingChunk, QuizDifficulty, PersonalizedQuizType } from '../types';
import { getConfig } from './configService'; // Import config service

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });

export interface GenerateQuizResponse {
  questions: QuizQuestion[];
  groundingChunks?: GroundingChunk[];
}

export interface IdentifiedSubtopicsResponse {
  newSubtopics: string[];
  confirmedExistingSubtopics: string[]; 
}

const loadPrompt = async (filePath: string): Promise<string> => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Prompt dosyası yüklenemedi: ${filePath}, Durum: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Prompt dosyası '${filePath}' yüklenirken ağ hatası:`, error);
    throw new Error(`Prompt dosyası yüklenirken hata oluştu: ${filePath}. Tarayıcı konsolunu kontrol edin.`);
  }
};


export const identifySubtopicsFromText = async (
  text: string,
  documentContextInfo?: string
): Promise<IdentifiedSubtopicsResponse> => {
  if (!API_KEY) {
    throw new Error("Gemini API Anahtarı ayarlanmamış. Lütfen ortam değişkenlerini kontrol edin.");
  }
  const appConfig = getConfig();
  const textSnippet = text.substring(0, appConfig.maxPdfTextLength);
  
  const templatePath = './prompts/identify_conceptual_subtopics_prompt.txt';
  let promptTemplate: string;
  try {
    promptTemplate = await loadPrompt(templatePath);
  } catch (loadError) {
     if (loadError instanceof Error) {
      console.error("Alt konu belirleme prompt şablonu yüklenemedi:", loadError.message);
      throw new Error(`Alt konu belirleme prompt şablonu yüklenemedi: ${loadError.message}`);
    }
    throw new Error("Alt konu belirleme prompt şablonu yüklenirken bilinmeyen bir hata oluştu.");
  }

  const effectiveDocumentContext = documentContextInfo || "verilen belge";

  let prompt = promptTemplate
    .replace('{{documentContext}}', effectiveDocumentContext)
    .replace('{{textSnippet}}', textSnippet);
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: appConfig.gemini.textModel,
      contents: prompt,
      config: {
        temperature: appConfig.gemini.identifySubtopics.temperature,
        thinkingConfig: { thinkingBudget: appConfig.gemini.identifySubtopics.thinkingBudget } 
      }
    });

    const rawResponseText = response.text?.trim() || "";

    if (rawResponseText === "Konu tespit edilemedi.") {
      return {
        newSubtopics: [],
        confirmedExistingSubtopics: []
      };
    }

    const lines = rawResponseText.split('\n');
    const parsedSubtopics: string[] = [];
    const topicRegex = /^(?:\*\s*)?(?:\s*\d+(?:\.\d+)*\.\s+)?(.*?)(?:\s*\((?:s\.|Bölüm)\s*[\w\d\s.-]+?\))?\s*$/;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        const match = trimmedLine.match(topicRegex);
        if (match && match[1]) {
          const topicText = match[1].trim();
          if (topicText) { 
            parsedSubtopics.push(topicText);
          }
        }
      }
    }
    
    // Maksimum alt konu sayısını sınırla
    const maxSubtopics = appConfig.quizDefaults.maxSubtopicsPerDocument || 10;
    if (parsedSubtopics.length > maxSubtopics) {
      console.log(`Alt konu sayısı ${parsedSubtopics.length}, maksimum ${maxSubtopics} ile sınırlandırılıyor`);
      parsedSubtopics.splice(maxSubtopics); // İlk 10'unu al
    }
    
    return {
      newSubtopics: parsedSubtopics,
      confirmedExistingSubtopics: [] 
    };

  } catch (error) {
    console.error("Error identifying subtopics with Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("Geçersiz Gemini API Anahtarı. Lütfen API anahtarınızı kontrol edin.");
        }
        throw new Error(`Alt konular belirlenirken bir Gemini API hatası oluştu: ${error.message}`);
    }
    throw new Error("Alt konular belirlenirken bilinmeyen bir hata oluştu.");
  }
};


export const generateQuizFromText = async (
  text: string | null, 
  numQuestions: number,
  numOptions: number,
  selectedSubtopics?: string[],
  quizMode?: 'quick' | 'personalized',
  difficulty?: QuizDifficulty,
  personalizedQuizType?: PersonalizedQuizType
): Promise<GenerateQuizResponse> => {
  if (!API_KEY) {
    throw new Error("Gemini API Anahtarı ayarlanmamış. Lütfen ortam değişkenlerini kontrol edin.");
  }
  const appConfig = getConfig();
  const minQuestionsPerSubtopicConfig = appConfig.quizDefaults.minQuestionsPerSubtopic;

  let promptFocusInstruction = "";
  let subtopicGuidance = "Her soru için, sorunun metinden hangi ana alt konuya ait olduğunu belirten bir 'subtopic' alanı ekleyin. Eğer belirgin bir alt konu yoksa bu alanı boş bırakabilirsiniz.";
  let questionDistributionInstruction = `Sınavda ${numQuestions} soru bulunsun.`;
  let difficultyInstructionText = "";
  let personalizationInstruction = "";
  let basePromptText = text ? `Lütfen sağlanan metne dayanarak çoktan seçmeli bir sınav oluşturun.` : `Lütfen aşağıda belirtilen alt konulara dayanarak çoktan seçmeli bir sınav oluşturun.`;


  if (difficulty) {
    switch (difficulty) {
      case 'Kolay':
        difficultyInstructionText = "Sorular temel kavramları ve tanımları sormalıdır. Basit ve anlaşılır bir dil kullanın.";
        break;
      case 'Orta':
        difficultyInstructionText = "Sorular, kavramların anlaşılmasını ve uygulanmasını gerektirmelidir. Senaryo tabanlı veya karşılaştırmalı sorular olabilir.";
        break;
      case 'Zor':
        difficultyInstructionText = "Sorular, derinlemesine analiz, sentez veya değerlendirme gerektirmelidir. Karmaşık senaryolar, istisnalar veya çoklu kavramların entegrasyonunu içerebilir.";
        break;
    }
  }

  if (quizMode === 'personalized') {
    if (personalizedQuizType === 'weak_topics') {
      personalizationInstruction = "Bu, kullanıcının zayıf olduğu konulara odaklanan bir sınavdır.";
      if (selectedSubtopics && selectedSubtopics.length > 0) {
        promptFocusInstruction = `Sınav YALNIZCA şu alt konulara odaklanmalıdır: ${selectedSubtopics.join(', ')}. Bu konulardaki temel eksiklikleri gidermeye yönelik sorular oluşturun.`;
        subtopicGuidance = `Her soru için, sorunun bu ZAYIF alt konulardan hangisine ait olduğunu belirten bir 'subtopic' alanı ekleyin. Bu alan DOĞRUDAN seçilen alt konulardan biri olmalıdır.`;
        if (!text) { 
             basePromptText = `Lütfen kullanıcının zayıf olduğu aşağıdaki alt konulara dayanarak çoktan seçmeli bir sınav oluşturun.`;
        }
      } else {
        promptFocusInstruction = "Kullanıcının zayıf konuları bulunamadı. Genel sorular oluşturun.";
        if (!text) {
             throw new Error("Zayıf konular sınavı için ne zayıf konu ne de metin sağlanmadı.");
        }
      }
    } else if (personalizedQuizType === 'new_topics') {
      personalizationInstruction = "Bu, belgedeki yeni konulara odaklanan bir sınavdır.";
      if (selectedSubtopics && selectedSubtopics.length > 0) {
        promptFocusInstruction = `Sınav YALNIZCA şu YENİ alt konulara odaklanmalıdır: ${selectedSubtopics.join(', ')}. Bu yeni konuların anlaşılmasını test eden sorular oluşturun.`;
        subtopicGuidance = `Her soru için, sorunun bu YENİ alt konulardan hangisine ait olduğunu belirten bir 'subtopic' alanı ekleyin. Bu alan DOĞRUDAN seçilen alt konulardan biri olmalıdır.`;
      } else {
         promptFocusInstruction = `Belgeden yeni alt konu belirlenemedi. Lütfen metnin genelinden sorular oluşturun.`;
      }
       if (!text) throw new Error("Yeni konular sınavı için metin sağlanmadı.");
    } else if (personalizedQuizType === 'comprehensive') {
      personalizationInstruction = "Bu kapsamlı bir sınavdır. Hem kullanıcının zayıf olduğu konuları hem de belgedeki yeni konuları içermelidir.";
      if (selectedSubtopics && selectedSubtopics.length > 0) {
        promptFocusInstruction = `Sınav, kullanıcının zayıf olduğu konuları ve belgedeki yeni konuları kapsamalıdır. Odaklanılacak konular şunlardır: ${selectedSubtopics.join(', ')}. Mümkünse zayıf konulara öncelik verin.`;
        subtopicGuidance = `Her soru için, sorunun bu KAPSAMLI alt konulardan hangisine ait olduğunu belirten bir 'subtopic' alanı ekleyin. Bu alan DOĞRUDAN seçilen alt konulardan biri olmalıdır.`;
      } else {
         promptFocusInstruction = `Kapsamlı sınav için konu belirlenemedi. Lütfen metnin genelinden sorular oluşturun.`;
      }
      if (!text) throw new Error("Kapsamlı sınav için metin sağlanmadı.");
    } else { 
        personalizationInstruction = "Bu kişiselleştirilmiş bir sınavdır. Lütfen metnin farklı zorluk seviyelerini ve önemli kavramlarını kapsayan, düşündürücü ve kapsamlı sorular oluşturmaya çalışın. Sorular, kullanıcının konuyu derinlemesine anlamasını teşvik etmelidir.";
        if (selectedSubtopics && selectedSubtopics.length > 0) {
            promptFocusInstruction = `Sınav YALNIZCA şu alt konulara odaklanmalıdır: ${selectedSubtopics.join(', ')}.`;
            subtopicGuidance = `Her soru için, sorunun bu seçilmiş alt konulardan hangisine ait olduğunu belirten bir 'subtopic' alanı ekleyin. Bu alan DOĞRUDAN seçilen alt konulardan biri olmalıdır.`;
        }
    }
    
    if (selectedSubtopics && selectedSubtopics.length > 0 && quizMode === 'personalized') {
        questionDistributionInstruction = `Toplam ${numQuestions} soru oluşturun. Bu soruları SEÇİLEN ALT KONULAR (${selectedSubtopics.join(', ')}) arasında dağıtın. Her bir seçili alt konu için en az ${minQuestionsPerSubtopicConfig} soru bulunmalıdır. Kalan soruları bu seçili alt konular arasında adil bir şekilde dağıtın.`;
    }

  } else { // Quick Quiz
    if (selectedSubtopics && selectedSubtopics.length > 0) {
        promptFocusInstruction = `Sınav YALNIZCA şu alt konulara odaklanmalıdır: ${selectedSubtopics.join(', ')}.`;
        subtopicGuidance = `Her soru için, sorunun bu seçilmiş alt konulardan hangisine ait olduğunu belirten bir 'subtopic' alanı ekleyin. Bu alan DOĞRUDAN seçilen alt konulardan biri olmalıdır.`;
        questionDistributionInstruction = `Toplam ${numQuestions} soru oluşturun. Bu soruları SEÇİLEN ALT KONULAR (${selectedSubtopics.join(', ')}) arasında dağıtın. Her bir seçili alt konu için en az ${minQuestionsPerSubtopicConfig} soru bulunmalıdır. Kalan soruları bu seçili alt konular arasında adil bir şekilde dağıtın.`;
    }
    if (!text) throw new Error("Hızlı sınav için metin sağlanmadı.");
  }
  
  let promptTemplate: string;
  try {
    promptTemplate = await loadPrompt('./prompts/generate_quiz_prompt_template.txt');
  } catch (loadError) {
    if (loadError instanceof Error) {
      console.error("Sınav oluşturma prompt şablonu yüklenemedi:", loadError.message);
      throw new Error(`Sınav oluşturma prompt şablonu yüklenemedi: ${loadError.message}`);
    }
    throw new Error("Sınav oluşturma prompt şablonu yüklenirken bilinmeyen bir hata oluştu.");
  }

  const difficultyInstructionSection = difficultyInstructionText ? difficultyInstructionText + '\n' : '';
  const mainTextContent = text 
    ? `Sağlanan metin (yalnızca bu metni ve belirtilen alt konuları kullanın):\n---\n${text.substring(0, appConfig.maxPdfTextLength)}\n---` 
    : (personalizedQuizType === 'weak_topics' && selectedSubtopics && selectedSubtopics.length > 0 
        ? `Lütfen soruları yalnızca şu alt konulara dayandırın: ${selectedSubtopics.join(', ')}.` 
        : '');

  const prompt = promptTemplate
    .replace('{{basePromptText}}', basePromptText)
    .replace('{{difficultyInstructionSection}}', difficultyInstructionSection)
    .replace('{{personalizationInstruction}}', personalizationInstruction)
    .replace('{{promptFocusInstruction}}', promptFocusInstruction)
    .replace('{{questionDistributionInstruction}}', questionDistributionInstruction)
    .replace('{{numOptions}}', String(numOptions))
    .replace('{{subtopicGuidance}}', subtopicGuidance)
    .replace('{{mainTextContent}}', mainTextContent);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: appConfig.gemini.textModel,
      contents: prompt,
      config: {
        responseMimeType: appConfig.gemini.generateQuiz.responseMimeType,
        temperature: quizMode === 'personalized' ? appConfig.gemini.generateQuiz.personalizedTemperature : appConfig.gemini.generateQuiz.defaultTemperature,
        thinkingConfig: { thinkingBudget: appConfig.gemini.generateQuiz.thinkingBudget } 
      }
    });

    let jsonStr = response.text?.trim() || "";
    
    // Debug logging
    console.log("Gemini Model Response Length:", jsonStr.length);
    console.log("Gemini Model Response Preview:", jsonStr.substring(0, 200) + "...");

    if (!jsonStr) {
      throw new Error("Gemini'den boş yanıt alındı. Model metnin özünü yakalayamadığı için soru oluşturamayabilir.");
    }
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw JSON String:", jsonStr);
      throw new Error("Gemini'den alınan yanıt geçerli JSON formatında değil. Model beklenmedik bir format döndürmüş olabilir.");
    }

    // Enhanced validation
    if (!Array.isArray(parsedData)) {
      console.error("Response is not an array:", typeof parsedData, parsedData);
      throw new Error("Gemini yanıtı beklenen dizi formatında değil. Model farklı bir yapı döndürmüş.");
    }

    if (parsedData.length === 0) {
      console.warn("Gemini sıfır soru döndürdü. Prompt veya metin içeriği yetersiz olabilir.");
      throw new Error("Model hiç soru oluşturamadı. Metin içeriği yetersiz olabilir veya seçilen konular çok spesifik olabilir.");
    }

    // Question validation with detailed error reporting
    const validationErrors: string[] = [];
    parsedData.forEach((q, index) => {
      if (!isValidQuestion(q, numOptions)) {
        validationErrors.push(`Soru ${index + 1}: ${getQuestionValidationError(q, numOptions)}`);
      }
    });

    if (validationErrors.length > 0) {
      console.error("Question validation errors:", validationErrors);
      throw new Error(`Oluşturulan sorularda format hataları var:\n${validationErrors.join('\n')}`);
    }
    // Subtopic validation for personalized quizzes
    if (quizMode === 'personalized' && selectedSubtopics && selectedSubtopics.length > 0) {
      const invalidSubtopics = parsedData.filter(q => 
        q.subtopic && !selectedSubtopics.includes(q.subtopic)
      );
      if (invalidSubtopics.length > 0) {
        console.warn("Model seçilen alt konular dışında konular döndürdü:", invalidSubtopics.map(q => q.subtopic));
        // Don't throw error, just warn as this might be acceptable in some cases
      }
    }

    const questionsWithIds: QuizQuestion[] = parsedData.map((q, index) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${index}`,
      subtopic: q.subtopic || undefined, 
    }));

    return { questions: questionsWithIds, groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined };

  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
     if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("Geçersiz Gemini API Anahtarı. Lütfen API anahtarınızı kontrol edin.");
        }
        throw new Error(`Sınav oluşturulurken bir Gemini API hatası oluştu: ${error.message}`);
    }
    throw new Error("Sınav oluşturulurken bilinmeyen bir hata oluştu.");
  }
};

const isValidQuestion = (item: any, expectedNumOptions: number): item is QuizQuestion => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.question === 'string' &&
    Array.isArray(item.options) &&
    item.options.every((opt: any) => typeof opt === 'string') &&
    item.options.length === expectedNumOptions && // Exact match for expected options
    typeof item.correctAnswerIndex === 'number' &&
    item.correctAnswerIndex >= 0 &&
    item.correctAnswerIndex < item.options.length &&
    (typeof item.subtopic === 'string' || typeof item.subtopic === 'undefined')
  );
};

const getQuestionValidationError = (item: any, expectedNumOptions: number): string => {
  if (typeof item !== 'object' || item === null) {
    return 'Soru nesnesi geçersiz';
  }
  if (typeof item.question !== 'string') {
    return 'Soru metni eksik veya geçersiz';
  }
  if (!Array.isArray(item.options)) {
    return 'Seçenekler dizi formatında değil';
  }
  if (item.options.length !== expectedNumOptions) {
    return `Beklenen seçenek sayısı ${expectedNumOptions}, alınan ${item.options.length}`;
  }
  if (!item.options.every((opt: any) => typeof opt === 'string')) {
    return 'Bazı seçenekler metin formatında değil';
  }
  if (typeof item.correctAnswerIndex !== 'number') {
    return 'Doğru cevap indeksi sayı formatında değil';
  }
  if (item.correctAnswerIndex < 0 || item.correctAnswerIndex >= item.options.length) {
    return 'Doğru cevap indeksi geçersiz aralıkta';
  }
  return 'Bilinmeyen validasyon hatası';
};
