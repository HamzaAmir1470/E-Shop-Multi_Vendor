import React from 'react'
import styles from '../../styles/styles'

const CheckoutSteps = ({ active }) => {
    
    const steps = [
        { number: 1, name: 'Shipping' },
        { number: 2, name: 'Payment' },
        { number: 3, name: 'Success' }
    ];

    return (
        <div className='w-full flex justify-center mt-5 md:mt-0 '>
            <div className="w-[90%] 800px:w-[60%] flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                                    ${active >= step.number 
                                        ? 'bg-[#f63b60] text-white' 
                                        : 'bg-[#FDE1E6] text-[#f63b60]'
                                    }`}
                            >
                                {active > step.number ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span className={`mt-2 text-sm font-medium
                                ${active >= step.number ? 'text-[#f63b60]' : 'text-gray-400'}`}>
                                {step.name}
                            </span>
                        </div>

                        {/* Connector Line (except after last step) */}
                        {index < steps.length - 1 && (
                            <div 
                                className={`flex-1 h-1 mx-2 rounded
                                    ${active > step.number ? 'bg-[#f63b60]' : 'bg-[#FDE1E6]'}`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default CheckoutSteps