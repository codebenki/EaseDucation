import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/services/supabase.service";

export default function QuizSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // New loading state for submission
  const [currentIndex, setCurrentIndex] = useState(0);

  // NEW: State for all answers
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const [result, setResult] = useState<any>(null); // To store score from backend

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  async function fetchQuiz() {
    const { data, error } = await supabase
      .from("questionnaires")
      .select("*, questions(*)")
      .eq("id", id)
      .single();

    if (!error) {
      setQuiz(data);
      // Initialize answer array with nulls matching number of questions
      setAnswers(new Array(data.questions.length).fill(null));
    }
    setLoading(false);
  }

  // Updates the specific index in the answers array
  const handleAnswer = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = idx;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      // Send to backend
      const response = await fetch("YOUR_BACKEND_URL/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: id,
          answers: answers,
        }),
      });

      const data = await response.json();
      setResult(data); // data might be { score: 5, total: 5, message: "..." }
    } catch (e) {
      console.error("Evaluation failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" className="flex-1" />;
  if (!quiz) return <Text>Quiz not found.</Text>;

  // RESULT SCREEN
  if (result) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-2xl font-bold">Quiz Complete!</Text>
        <Text className="text-lg my-4">
          Score: {result.score} / {quiz.questions.length}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-blue-600 p-4 rounded-xl"
        >
          <Text className="text-white">Return to Chat</Text>
        </Pressable>
      </View>
    );
  }

  const question = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="text-xl font-bold mb-6">{quiz.title}</Text>
      <Text className="text-lg mb-8">{question.question_text}</Text>

      {question.options.map((opt: string, idx: number) => (
        <Pressable
          key={idx}
          onPress={() => handleAnswer(idx)}
          className={`p-4 mb-3 rounded-xl border-2 ${
            answers[currentIndex] === idx
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200"
          }`}
        >
          <Text>{opt}</Text>
        </Pressable>
      ))}

      {/* NAVIGATION / SUBMIT BUTTON */}
      {answers[currentIndex] !== null && (
        <Pressable
          onPress={
            isLastQuestion
              ? submitQuiz
              : () => setCurrentIndex(currentIndex + 1)
          }
          disabled={submitting}
          className={`mt-6 p-4 rounded-xl items-center ${submitting ? "bg-gray-400" : "bg-green-500"}`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">
              {isLastQuestion ? "Submit Quiz" : "Next Question"}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}
