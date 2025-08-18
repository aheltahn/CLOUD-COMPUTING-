export default function StripedText({ children }) {
    return (
      <h1 className=" relative text-[20rem] font-bold flex justify-center">
  
        {/* Layer chữ sọc dọc mờ */}
        <span className="mt-24 relative text-transparent bg-clip-text opacity-30
         bg-[repeating-linear-gradient(90deg,#FFFFFF,#FFFFFF_2px,transparent_2px,transparent_8px)]">
          {children}
        </span>
      </h1>
    );
  }
  