import { Link } from 'react-router-dom'

export default function Error() {
  return (
    <div className='flex items-center justify-center flex-col gap-5 h-screen'>
        <h1 className='text-red-500 text-5xl font-bold uppercase'>Page not found</h1>
        <Link to="/" className='text-lg font-medium font-roboto text-white bg-[#1F547C] rounded-full px-8 py-3 hover:scale-110 capitalize'>Back to home</Link>
    </div>
  )
}
