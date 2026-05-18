import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MiddleSchoolSimulationType } from './MiddleSchoolLab';
import { CheckCircle2, XCircle, Award, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizData {
  title: string;
  questions: { question: string; options: string[]; answerIndex: number; explanation: string }[];
  badge: string;
}

const QUIZZES: Record<string, QuizData> = {
  wave_particle: {
    title: "Wave-Particle Duality Quiz",
    badge: "Double-Slit Detective",
    questions: [
      {
        question: "When electrons are fired through a double slit unobserved, what pattern do they form on the screen?",
        options: ["Two solid lines", "An interference pattern of many bands", "A single dot", "A random scatter"],
        answerIndex: 1,
        explanation: "Unobserved electrons travel as a probability wave, interfering with themselves to create an interference pattern!"
      },
      {
        question: "What happens if you observe which slit an electron goes through?",
        options: ["The interference pattern disappears", "The pattern gets brighter", "The electron splits in half", "Nothing changes"],
        answerIndex: 0,
        explanation: "Observation collapses the wave function, making them act like particles with no interference pattern."
      }
    ]
  },
  probability: {
    title: "Probability Amplitudes Quiz",
    badge: "Probability Navigator",
    questions: [
      {
        question: "Before measurement, where is an electron?",
        options: ["Orbiting exactly like a planet", "In the nucleus", "In a superposition of many possible locations", "It doesn't exist"],
        answerIndex: 2,
        explanation: "Before we check, its location is defined by a probability cloud, meaning it exists in a superposition of possible spots!"
      },
      {
        question: "What does the probability cloud represent?",
        options: ["The electron's speed", "Where the electron is most likely to be found", "The electron's temperature", "Air pressure"],
        answerIndex: 1,
        explanation: "Denser parts of the cloud mean a higher probability amplitude, so we are more likely to find the electron there upon measurement."
      }
    ]
  },
  quantum_gates: {
    title: "Quantum Gates Quiz",
    badge: "Circuit Builder",
    questions: [
      {
        question: "What does a Hadamard (H) gate do to a qubit in the |0⟩ state?",
        options: ["Turns it into |1>", "Leaves it as |0>", "Destroys the qubit", "Puts it into a superposition of |0> and |1>"],
        answerIndex: 3,
        explanation: "The H gate creates a superposition, giving the qubit a 50/50 chance of being measured as 0 or 1!"
      },
      {
        question: "If a qubit is in an equal superposition, what are the chances of measuring a 1?",
        options: ["100%", "0%", "50%", "25%"],
        answerIndex: 2,
        explanation: "An equal superposition means there's a perfectly even split (50%) between measuring 0 and 1."
      }
    ]
  }
};

interface MiddleSchoolQuizProps {
  simulationType: MiddleSchoolSimulationType;
  onComplete: (points: number, badge: string) => void;
  onClose: () => void;
}

export default function MiddleSchoolQuiz({ simulationType, onComplete, onClose }: MiddleSchoolQuizProps) {
  const quiz = (simulationType !== 'none' && QUIZZES[simulationType]) ? QUIZZES[simulationType] : null;
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  if (!quiz) return null;

  const currentQ = quiz.questions[currentQuestionIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    if (idx === currentQ.answerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    const updatedAnswers = [...userAnswers, selectedAnswer!];
    setUserAnswers(updatedAnswers);
    
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(idx => idx + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleClaimReward = () => {
    onComplete(score * 50, quiz.badge);
  };

  if (isFinished) {
    if (isReviewing) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm rounded-[2.5rem]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative max-w-2xl w-full border-4 border-teal-100 max-h-[90%] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-teal-800">Review Answers</h2>
              <span className="bg-teal-100 text-teal-700 font-bold px-3 py-1 rounded-full text-sm">
                Score: {score}/{quiz.questions.length}
              </span>
            </div>

            <div className="space-y-8 mb-8">
              {quiz.questions.map((q, idx) => {
                const userAns = userAnswers[idx];
                const isCorrect = userAns === q.answerIndex;
                
                return (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                    <p className="font-bold text-slate-800 mb-4">{idx + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        let rowClass = "p-3 rounded-lg border-2 flex justify-between items-center text-sm font-medium ";
                        if (optIdx === q.answerIndex) {
                          rowClass += "bg-green-100 border-green-500 text-green-800";
                        } else if (optIdx === userAns && !isCorrect) {
                          rowClass += "bg-red-100 border-red-500 text-red-800";
                        } else {
                          rowClass += "bg-white border-slate-200 text-slate-500 opacity-60";
                        }

                        return (
                          <div key={optIdx} className={rowClass}>
                            <span>{opt}</span>
                            {optIdx === q.answerIndex && <CheckCircle2 className="text-green-600" size={18} />}
                            {optIdx === userAns && !isCorrect && <XCircle className="text-red-600" size={18} />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 text-sm text-teal-800 bg-teal-50 p-3 rounded-lg border border-teal-200">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsReviewing(false)}
                className="text-slate-500 font-bold hover:text-slate-700 transition px-4"
              >
                Back to Summary
              </button>
              <button
                onClick={handleClaimReward}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition transform active:scale-95"
              >
                Claim Reward <Award size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm rounded-[2.5rem]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative max-w-lg w-full border-4 border-teal-100 text-center"
        >
          <div className="mb-6 inline-flex p-4 bg-teal-100 rounded-full text-teal-600">
            <Award size={48} />
          </div>
          <h2 className="text-3xl font-black text-teal-800 mb-2">Quiz Completed!</h2>
          <p className="text-lg text-slate-600 mb-8 font-bold">
            You scored {score} out of {quiz.questions.length}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsReviewing(true)}
              className="bg-slate-100 text-slate-700 font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition"
            >
              <RotateCcw size={20} /> Review Answers
            </button>
            <button
              onClick={handleClaimReward}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition transform active:scale-95 text-lg"
            >
              Claim XP & Badge <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const progressPercent = ((currentQuestionIdx + (isAnswered ? 1 : 0)) / quiz.questions.length) * 100;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/40 backdrop-blur-sm rounded-[2.5rem]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative max-w-lg w-full border-4 border-teal-100"
      >
        <div 
          className="w-full bg-teal-100 h-2.5 rounded-full mb-6 overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <motion.div 
            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-teal-800">{quiz.title}</h2>
          <span className="bg-teal-100 text-teal-700 font-bold px-3 py-1 rounded-full text-sm">
            Q {currentQuestionIdx + 1}/{quiz.questions.length}
          </span>
        </div>

        <p className="text-lg font-bold text-slate-700 mb-6">{currentQ.question}</p>

        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQ.answerIndex;
            
            let btnClass = "w-full text-left p-4 rounded-xl font-bold transition-all border-2 outline-none ";
            
            if (!isAnswered) {
              btnClass += "bg-slate-50 border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-700";
            } else {
              if (isCorrect) {
                btnClass += "bg-green-100 border-green-500 text-green-800";
              } else if (isSelected && !isCorrect) {
                btnClass += "bg-red-100 border-red-500 text-red-800";
              } else {
                btnClass += "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
              }
            }

            return (
              <motion.button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={btnClass}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                animate={isAnswered && isSelected ? { scale: [1, 1.05, 1] } : {}}
                aria-pressed={isSelected}
              >
                <div className="flex justify-between items-center">
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="text-green-600" size={20} aria-label="Correct" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-600" size={20} aria-label="Incorrect" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl mb-6 text-blue-900 font-medium"
              role="alert"
            >
              {currentQ.explanation}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center">
          <button 
            onClick={onClose}
            className="text-slate-500 font-bold hover:text-slate-700 transition focus:ring-4 focus:ring-slate-200 focus:outline-none rounded-lg px-2 py-1"
          >
            Cancel
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition transform active:scale-95 focus:ring-4 focus:ring-teal-300 focus:outline-none"
          >
            {currentQuestionIdx < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

