/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function DropDownComponent({ primaryLabel, label1, label2, label1onClick, label2onClick, label3, label3onClick }) {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 sm:px-4 py-2 text-white bg-brand-primary-medium hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 font-semibold">
                    {primaryLabel}
                    <ChevronDownIcon className="-mr-1 ml-2 h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="z-20 origin-top-right absolute right-0 mt-2 w-30 font-bold rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={label1onClick}
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700',
                                        'block px-4 py-2 w-full text-left font-semibold'
                                    )}
                                >
                                    {label1}
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={label2onClick}
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700',
                                        'block px-4 py-2 w-full text-left font-semibold z-20'
                                    )}
                                >
                                    {label2}
                                </button>
                            )}
                        </Menu.Item>
                        {label3 && (
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={label3onClick}
                                        className={classNames(
                                            active ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700',
                                            'block px-4 py-2 w-full text-left font-semibold z-20'
                                        )}
                                    >
                                        {label3}
                                    </button>
                                )}
                            </Menu.Item>
                        )}

                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}