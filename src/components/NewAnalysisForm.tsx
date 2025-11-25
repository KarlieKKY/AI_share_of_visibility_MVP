interface NewAnalysisFormProps {
  prompt: string;
  target: string;
  promptError: string;
  targetError: string;
  submitting: boolean;
  disabled: boolean;
  onPromptChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onSubmit: () => void;
}

export const NewAnalysisForm = ({
  prompt,
  target,
  promptError,
  targetError,
  submitting,
  disabled,
  onPromptChange,
  onTargetChange,
  onSubmit,
}: NewAnalysisFormProps) => {
  return (
    <div className="bg-white rounded-3xl px-8 py-4 shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 uppercase">
        NEW ANALYSIS
      </h2>

      <div className="space-y-4">
        {/* Prompt and Target Input Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Prompt Input - 2 columns */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Enter your search query or prompt..."
              className={`w-full px-4 py-3 bg-gray-50 border ${
                promptError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d5266] focus:border-transparent resize-none`}
              rows={1}
              disabled={disabled}
            />
            {promptError && (
              <p className="text-red-500 text-sm mt-1">{promptError}</p>
            )}
          </div>

          {/* Target Input - 1 column */}
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
              Target
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => onTargetChange(e.target.value)}
              placeholder="Enter target company or brand..."
              className={`w-full px-4 py-3 bg-gray-50 border ${
                targetError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d5266] focus:border-transparent`}
              disabled={disabled}
            />
            {targetError && (
              <p className="text-red-500 text-sm mt-1">{targetError}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="flex items-center gap-2 px-6 py-3 bg-[#2c3e50] text-white rounded-lg hover:bg-[#34495e] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Start Analysis
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
