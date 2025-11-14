import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, signal, Signal, viewChild, ViewChild, viewChildren, computed } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapAdvancedMarker,MapInfoWindow} from '@angular/google-maps';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMapsModule, GoogleMap, MapAdvancedMarker, MapInfoWindow, LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Map {
  center: google.maps.LatLngLiteral = { lat: 4.5769013, lng: -74.1608906 };
  zoom = 14;

  placeResource = httpResource<Places[]>(() => '/places.json');
  searchTerm = signal<string>('');

  // Computed para filtrar lugares según el término de búsqueda
  filteredPlaces = computed(() => {
    const places = this.placeResource.value();
    const search = this.searchTerm().toLowerCase();
    
    if (!search) return places;
    
    return places?.filter(place => 
      place.place.toLowerCase().includes(search) ||
      place.barrio.toLowerCase().includes(search) ||
      place.localidad.toLowerCase().includes(search) ||
      place.direccion.toLowerCase().includes(search)
    );
  });

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
  selectedPlace: Signal<Places | null> = signal<Places | null>(null);

  @ViewChild(GoogleMap) mapReference!: GoogleMap;

  private infoWindowReference = viewChild.required<MapInfoWindow>(MapInfoWindow);
  private placeReference = viewChildren<ElementRef<HTMLDivElement>>('places');
  private advanceMarkers = viewChildren<MapAdvancedMarker>(MapAdvancedMarker);
  

  changeLocation(place: Places, marker?: MapAdvancedMarker, index?: number) {
    
    this.selectedPlace = signal<Places | null>(place);
    this.center = { lat: place.latitud, lng: place.longitud };
    this.mapReference.googleMap?.panTo(this.center);
    const placeIndex = this.placeResource.value()?.findIndex(p => p.idPlace === place.idPlace);

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

  getMarkerContent(place: Places) {
    if (place.idPlace === this.selectedPlace()?.idPlace) {
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
export interface Places {
  idPlace: number;
  place: string;
  direccion: string;
  openingHours: string;
  closingHours: string;
  latitud: number;
  longitud: number;
  ciudad: string;
  localidad: string;
  barrio: string;
  closeStoreString: string;
}
