
export default function Preloader({text="Loading data..."}) {
    return (
        <div className="absolute py-10 top-0 left-0 bg-white bg-opacity-70 backdrop-blur-sm w-full h-full flex items-center justify-center text-lg md:text-xl text-black text-opacity-45">
            {text}
        </div>
    )
}
