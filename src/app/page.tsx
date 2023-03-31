"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useMemo, useState } from "react";

const InputClassName = `w-full bg-white rounded border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`;
const buttonClassName = `text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-sm`
export default function Home() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });

  return (
    <main>
      <header className="text-gray-600 body-font border-b-2 shadow-sm">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <span className="ml-3 text-xl">Travel Planner</span>
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center"></nav>
        </div>
      </header>
      {!isLoaded ? <p> Loading... </p> : <AppContainer />}
    </main>
  );
}

type Coordinates = {
  lat: any;
  lng: any;
};

const AppContainer = () => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();
  const center = useMemo(() => ({ lat: 43.45, lng: -80.49 }), []);
  const [selected, setSelected] = useState<Coordinates | null>(null);

  const handleSelect = async (address: string) => {
    setValue(address);

    clearSuggestions();

    // get the co-ordinates based on the address

    const response = await getGeocode({ address });
    const { lat, lng } = await getLatLng(response[0]);

    setSelected({ lat, lng });
  };

  return (
    <div className="container p-5 mx-auto">
      <div className=" flex flex-row space-x-4 mb-4 flex-start">
        <div></div>
        <div className="w-full mb-4">
          <Combobox onSelect={handleSelect}>
            <ComboboxInput
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!ready}
              className="w-full bg-white rounded border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              placeholder="Search an address"
            />
            <ComboboxPopover>
              <ComboboxList className="bg-white p-4 border">
                {status === "OK" &&
                  data.map(({ place_id, description }) => (
                    <ComboboxOption
                      className="pb-2 cursor-pointer"
                      key={place_id}
                      value={description}
                    />
                  ))}
              </ComboboxList>
            </ComboboxPopover>
          </Combobox>
          {/* add destinations  */}

          <div className="mt-4">
            <DestinationComponent />
          </div>
        </div>

        <GoogleMap
          zoom={10}
          center={selected || center}
          mapContainerClassName="map-container w-full h-[calc(100vh-90px)]"
        >
          {selected && <Marker position={selected} />}
        </GoogleMap>
      </div>
    </div>
  );
};

const DestinationComponent = () => {
  const {
    ready,
    // value,
    // setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const [value, setValue] = useState<any>(null);
  const [index, setIndex] = useState(0);

  const [destinationsInput, setDestinationsInput] = useState<any>([]);


  const handleAddDestinations = () => {
    setIndex(prevIndex => prevIndex + 1);

    setDestinationsInput([...destinationsInput, {index}])
  };

  return (
    <>

      <button onClick={handleAddDestinations} className={`${buttonClassName} mb-4`}> + Add Destinations </button>

      {destinationsInput.map((destination:any) => {
        return (
          <>
            <Combobox className="pb-4">
              <ComboboxInput
                // value={value}
                // onChange={(e) => setValue({
                //   ...value,
                //   e.target.value)}
                disabled={!ready}
                className={InputClassName}
                placeholder={`destination ${destination.index}`}
              />
              <ComboboxPopover>
                <ComboboxList className="bg-white p-4 border">
                  {status === "OK" &&
                    data.map(({ place_id, description }) => (
                      <ComboboxOption
                        className="pb-2 cursor-pointer"
                        key={place_id}
                        value={description}
                      />
                    ))}
                </ComboboxList>
              </ComboboxPopover>
            </Combobox>
          </>
        );
      })}
    </>
  );
};
