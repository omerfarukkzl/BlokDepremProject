import React from 'react';
import PredictionForm from '../../../components/features/predictions/PredictionForm';
import PredictionResult from '../../../components/features/predictions/PredictionResult';

const PredictionsPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        AI Aid Prediction
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Select a region to generate AI-based aid quantity predictions.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Request Prediction</h3>
                        <PredictionForm />
                    </div>
                </div>

                <div>
                    <PredictionResult />
                </div>
            </div>
        </div>
    );
};

export default PredictionsPage;
