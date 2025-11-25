interface AnswerModalProps {
  answerText: string;
  onClose: () => void;
}

export const AnswerModal = ({ answerText, onClose }: AnswerModalProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-lg max-w-3xl max-h-[80vh] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-8 pb-4 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">Full Answer</h3>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-700 text-3xl font-normal leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-8 pb-8">
          <p className="text-gray-700 italic whitespace-pre-wrap">
            "{answerText}"
          </p>
        </div>
      </div>
    </div>
  );
};
