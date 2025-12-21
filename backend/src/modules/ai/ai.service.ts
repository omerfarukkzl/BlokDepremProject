import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async getDistributionSuggestions(): Promise<any> {
    // Mock response
    return {
      message: 'AI distribution suggestions are not yet implemented.',
      suggestions: [
        {
          from: 'Istanbul',
          to: 'Ankara',
          items: ['Water', 'Food'],
          priority: 1,
        },
        {
          from: 'Izmir',
          to: 'Antalya',
          items: ['Tents', 'Blankets'],
          priority: 2,
        },
      ],
    };
  }
}
