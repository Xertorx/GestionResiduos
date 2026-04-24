import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, signal, viewChild, ViewChild, viewChildren, computed, OnInit } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapAdvancedMarker,MapInfoWindow} from '@angular/google-maps';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../enviroment/enviroment';

//Interface de la respuesta de la API para los ecopuntos
export interface EcoPoint{
  id : number;
  name : string;
  address : string;
  latitude : number;
  longitude : number;
  description : string;
  status : string;
  residueTypes : string[];
  neighborhood: number;
  openingTime: string;
  closingTime: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMapsModule, GoogleMap, MapAdvancedMarker, MapInfoWindow, LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Map implements OnInit{

  ngOnInit(): void {
    this.getEcopoints();
  }
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {

  }

  EcoPoints = signal<EcoPoint[]>([]);
  center: google.maps.LatLngLiteral = { lat: 4.5769013, lng: -74.1608906 };
  zoom = 14;

  searchTerm = signal<string>('');

  // Computed para filtrar lugares según el término de búsqueda
  filteredPlaces = computed(() => {
    const places = this.EcoPoints();
    const search = this.searchTerm().toLowerCase();
    
    if (!search) return places;
    
    return places.filter(place => 
      place.name.toLowerCase().includes(search) ||
      place.address.toLowerCase().includes(search) ||
      place.description.toLowerCase().includes(search)
    );
  });
  
  getEcopoints() {
    this.http.get<EcoPoint[]>(`${environment.apiUrl}/ecopoints`).subscribe({
      next: (data) => {
        this.EcoPoints.set(data);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error obteniendo ecopoints:', error);
      }
    });
  }  

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  mapOptions: google.maps.MapOptions = {
    mapId: 'd5b799dc1d3eef6cabf958d0',
    zoomControl: true,
  }
  markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
    gmpDraggable: false,

  }
  selectedPlace = signal<EcoPoint | null>(null);

  @ViewChild(GoogleMap) mapReference!: GoogleMap;

  private infoWindowReference = viewChild.required<MapInfoWindow>(MapInfoWindow);
  private placeReference = viewChildren<ElementRef<HTMLDivElement>>('places');
  private advanceMarkers = viewChildren<MapAdvancedMarker>(MapAdvancedMarker);
  

  changeLocation(place: EcoPoint, marker?: MapAdvancedMarker, index?: number) {
    
    this.selectedPlace.set(place);
    this.center = { lat: place.latitude, lng: place.longitude };
    this.mapReference.googleMap?.panTo(this.center);
    const placeIndex = this.EcoPoints().findIndex(p => p.id === place.id);

    this.infoWindowReference().open(marker ?? this.advanceMarkers().at(index!));
  

    if (placeIndex !== undefined && placeIndex >= 0) {
      const placeElement = this.placeReference().at(placeIndex)?.nativeElement;
      const container = document.getElementById('sidebar');
      if (container && placeElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = placeElement.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top + container.scrollTop - container.clientHeight / 2 + elementRect.height / 2;
        container.scrollTo({ top: offset, behavior: 'smooth' });
      } else if (placeElement) {
        placeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  getMarkerContent(place: EcoPoint) {
    if (place.id === this.selectedPlace()?.id) {
      const beachFlag = 'img/icons/trash-2.svg'
      let imgTag = document.createElement('img');
      imgTag.src = beachFlag;
      imgTag.className = 'w-6 h-6';
      return imgTag;
    } else {
      return null;
    }
  }
}
