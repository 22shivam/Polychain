import { useState } from 'react'
import { Dialog } from '@headlessui/react'

export default function MyDialog() {
    let [isOpen, setIsOpen] = useState(true)

    return (
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded inline-block" role="">
            <strong class="font-bold">Success! </strong>
            <span class="font-semibold">Wallet Connected.</span>

        </div>
    )
}