import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-indigo-600/95 backdrop-blur-md z-50 shadow-lg">
      <div className="flex items-center h-full px-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden">
            <Image
              src="/anonichat-logo.png"
              alt="AnoniChat 로고"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            AnoniChat
          </h1>
        </div>
      </div>
    </header>
  );
}