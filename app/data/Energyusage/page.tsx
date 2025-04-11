// import { SquareActivityIcon } from 'lucide-react'
// import Link from 'next/link'
// import { StepBackIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import Solardata from '@/components/Solardata'

const page = () => {
  return (
    
    <>
    <Solardata/>
    <div className='flex flex-row gap-5 px-8 items-center justify-center mt-24 max-md:mt-10 max-md:flex-col'>                 
               
        <Link href="/data/Energyusage/Kitchen" className="w-[33%] max-md:ml-0 max-md:w-full">
          <div className=" hover:border-yellow-300 px-6 py-24 text-xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 max-md:px-2 max-md:pt-24">
          <h1 className='text-black text-center text-4xl'>KITCHEN</h1>
          </div>
        </Link>

        <Link href='/data/Energyusage/Parlour' className="w-[33%] max-md:ml-0 max-md:w-full">
          <div className=" hover:border-yellow-300 px-6 py-24 text-xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 max-md:px-2 max-md:pt-24">
          <h1 className='text-black text-center text-4xl'>PARLOUR</h1>
          </div>
        </Link>

        <Link href="/data/Energyusage/Bedroom" className="w-[33%] max-md:ml-0 max-md:w-full">
          <div className=" hover:border-yellow-300 px-6 py-24 text-xl text-center text-white rounded-3xl border-gray-700 border-solid border-4 max-md:px-2 max-md:pt-24">
          <h1 className='text-black text-center text-4xl'>BEDROOM</h1>
          </div>
        </Link>
    </div>
    </>
  )
}

export default page
