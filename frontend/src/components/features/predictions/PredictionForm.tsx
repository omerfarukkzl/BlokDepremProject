import React, { useEffect, useState } from 'react';
import locationService, { type Location } from '../../../services/locationService';
import { usePredictionStore } from '../../../stores/predictionStore';

const PredictionForm: React.FC = () => {
    const { fetchPrediction, isLoading } = usePredictionStore();
    const [regions, setRegions] = useState<Location[]>([]);
    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRegions = async () => {
            try {
                const data = await locationService.fetchRegions();
                setRegions(data);
                if (data.length > 0) {
                    setSelectedRegionId(String(data[0].id));
                }
            } catch (err) {
                setError('Failed to load regions');
            }
        };
        loadRegions();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRegionId) {
            fetchPrediction(selectedRegionId);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow rounded-lg">
            {error && <div className="text-red-500">{error}</div>}
            <div>
                <label htmlFor="region-select" className="block text-sm font-medium text-gray-700">Select Region</label>
                <select
                    id="region-select"
                    value={selectedRegionId}
                    onChange={(e) => setSelectedRegionId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    {regions.map((region) => (
                        <option key={region.id} value={region.id}>
                            {region.name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                disabled={isLoading || !selectedRegionId}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {isLoading ? 'Generating...' : 'Generate Prediction'}
            </button>
        </form>
    );
};

export default PredictionForm;
