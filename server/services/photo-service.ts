import axios from 'axios';

// Pexels API for free stock photos
const PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY'; // User would need to provide this
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
}

export interface VehiclePhoto {
  url: string;
  label: string;
  type: string;
  attribution?: string;
}

class PhotoService {
  private pexelsApiKey: string | null;

  constructor() {
    // Check for Pexels API key in environment
    this.pexelsApiKey = process.env.PEXELS_API_KEY || null;
  }

  async getVehiclePhotos(make: string, model: string, year: number): Promise<VehiclePhoto[]> {
    try {
      const photos: VehiclePhoto[] = [];
      
      // Try Pexels API first if available
      if (this.pexelsApiKey) {
        const pexelsPhotos = await this.getPexelsPhotos(make, model, year);
        photos.push(...pexelsPhotos);
      }
      
      // Fallback to generic car photos if no specific photos found
      if (photos.length === 0) {
        const genericPhotos = await this.getGenericCarPhotos();
        photos.push(...genericPhotos);
      }
      
      return photos.slice(0, 6); // Limit to 6 photos
    } catch (error) {
      console.error('Error fetching vehicle photos:', error);
      return this.getFallbackPhotos();
    }
  }

  private async getPexelsPhotos(make: string, model: string, year: number): Promise<VehiclePhoto[]> {
    if (!this.pexelsApiKey) {
      return [];
    }

    try {
      const searchQueries = [
        `${year} ${make} ${model}`,
        `${make} ${model}`,
        `${make} car`,
        'car automobile vehicle'
      ];

      for (const query of searchQueries) {
        const response = await axios.get<PexelsResponse>(
          `${PEXELS_BASE_URL}/search`,
          {
            headers: {
              'Authorization': this.pexelsApiKey,
            },
            params: {
              query,
              per_page: 15,
              orientation: 'landscape'
            }
          }
        );

        if (response.data.photos.length > 0) {
          return response.data.photos.map((photo, index) => ({
            url: photo.src.large,
            label: `${make} ${model} - Photo ${index + 1}`,
            type: 'exterior',
            attribution: `Photo by ${photo.photographer} on Pexels`
          }));
        }
      }

      return [];
    } catch (error) {
      console.error('Pexels API error:', error);
      return [];
    }
  }

  private async getGenericCarPhotos(): Promise<VehiclePhoto[]> {
    // Free generic car photos from various sources
    const genericPhotos = [
      {
        url: 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        label: 'Sedan - Exterior View',
        type: 'exterior',
        attribution: 'Photo by Unsplash'
      },
      {
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        label: 'Car - Side View',
        type: 'exterior',
        attribution: 'Photo by Unsplash'
      },
      {
        url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        label: 'Vehicle - Front View',
        type: 'exterior',
        attribution: 'Photo by Unsplash'
      },
      {
        url: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        label: 'Car Interior',
        type: 'interior',
        attribution: 'Photo by Unsplash'
      }
    ];

    return genericPhotos;
  }

  private getFallbackPhotos(): VehiclePhoto[] {
    // Fallback photos when all APIs fail
    return [
      {
        url: 'https://via.placeholder.com/800x600/e5e7eb/6b7280?text=Vehicle+Photo',
        label: 'Vehicle Photo Placeholder',
        type: 'exterior',
        attribution: 'Placeholder Image'
      }
    ];
  }

  async generateVehiclePhotos(vehicleId: number, make: string, model: string, year: number): Promise<VehiclePhoto[]> {
    console.log(`📸 Generating photos for ${year} ${make} ${model} (ID: ${vehicleId})`);
    
    const photos = await this.getVehiclePhotos(make, model, year);
    
    console.log(`✅ Generated ${photos.length} photos for vehicle ${vehicleId}`);
    return photos;
  }
}

export const photoService = new PhotoService();

export async function generateVehiclePhotos(vehicleId: number, make: string, model: string, year: number) {
  return await photoService.getVehiclePhotos(make, model, year);
}