'use client';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 md:h-20 bg-indigo-600/95 backdrop-blur-md z-50 shadow-lg">
      <div className="flex items-center h-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src="/anonichat-logo.png"
              alt="AnoniChat 로고"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
            AnoniChat
          </h1>
        </div>
      </div>
    </header>
  );
}