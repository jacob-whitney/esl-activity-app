import { BookOpenIcon } from '@heroicons/react/24/solid';

export default function Logo() {
  return (
    <div
      className={`flex flex-row items-center leading-none min-w-[190px]`}
    >
      <BookOpenIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-10 md:w-10" />
      <p className="text-lg sm:text-2xl md:text-[34px] font-thin">&nbsp;<span className="font-bold">ESL</span> Activity Portal</p>
    </div>
  );
}
