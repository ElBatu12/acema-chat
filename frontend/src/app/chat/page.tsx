export default function ChatIndexPage() {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center px-6 bg-gray-50">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-gray-600 mb-2">Tus conversaciones</h2>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        Selecciona una conversación de la lista o crea una nueva para empezar a chatear.
      </p>
    </div>
  )
}
