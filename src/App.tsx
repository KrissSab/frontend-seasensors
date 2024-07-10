import { useEffect, useState } from "react";
import io from "socket.io-client";
import Modal from "react-modal";
import { Sensor } from "./interfaces/sensor.interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import CustomProgressBar from "./progressBar";
import { countLeaveArea } from "./scripts/checkSesnorLeaveArea";
import { updateThrusterSpeed } from "./scripts/updateThrusterSpeed";
import SensorModal from "./components/modalSensor";

Modal.setAppElement("#root");

function App() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensorName, setSelectedSensorName] = useState<string | null>(
    null
  );
  const [axisX, setAxisX] = useState(0);
  const [axisY, setAxisY] = useState(0);
  const [axisZ, setAxisZ] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      if (name === "axisX") {
        setAxisX(numericValue);
      } else if (name === "axisY") {
        setAxisY(numericValue);
      } else if (name === "axisZ") {
        setAxisZ(numericValue);
      }
      checkInputs();
    }
  };

  const checkInputs = () => {
    if (axisX === 0 && axisY === 0 && axisZ === 0) {
      setIsConfirming(false);
    } else {
      setIsConfirming(true);
    }
  };

  const handleAction = (name: string) => {
    if (isConfirming) {
      updateThrusterSpeed(name, {
        xAxisSpeed: axisX,
        yAxisSpeed: axisY,
        zAxisSpeed: axisZ,
      });
      setIsConfirming(false);
    } else {
      setSelectedSensorName(null);
    }
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("getSensors", (response: Sensor[]) => {
        setSensors(response);
      });
    });

    const interval = setInterval(() => {
      socket.emit("getSensors", (data: Sensor[]) => {
        setSensors(data);
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedSensorName !== null) {
      const sensor = sensors.find(
        (sensor) => sensor.name === selectedSensorName
      );
      if (!sensor) {
        setSelectedSensorName(null);
      }
    }
  }, [sensors]);

  const openModal = (sensorName: string) => {
    setSelectedSensorName(sensorName);
  };

  const closeModal = () => {
    setAxisX(0);
    setAxisY(0);
    setAxisZ(0);
    setSelectedSensorName(null);
  };

  const selectedSensor =
    selectedSensorName !== null
      ? sensors.find((sensor) => sensor.name === selectedSensorName)
      : null;

  return (
    <div className="m-6 grid grid-cols-4 grid-rows-3 gap-5">
      {sensors.map((sensor, index) => {
        const leaveTime = parseFloat(
          countLeaveArea(
            sensor.position,
            sensor.waterSpeed,
            sensor.thrustersSpeed
          )
        );

        let borderColor = "border-green-500";
        let name = sensor.name;
        let temperature = sensor.temperature;

        if (leaveTime <= 0) {
          name = "sensor lost";
          temperature = 0;
          borderColor = "border-red-500";
        } else if (leaveTime < 10) {
          borderColor = "border-red-500";
        } else if (leaveTime < 30) {
          borderColor = "border-yellow-500";
        }

        return (
          <Card
            key={index}
            className={`hover:cursor-pointer hover:scale-105 duration-300 ${borderColor} border-2`}
            onClick={() => {
              if (name != "sensor lost") {
                openModal(sensor.name);
              }
            }}
          >
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>
                Temperature: {temperature}
                <CustomProgressBar value={temperature} max={100} />
                Sensor will leave area in: {leaveTime.toFixed(2)} seconds
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        );
      })}

      {selectedSensor && (
        <SensorModal
          sensor={selectedSensor}
          isOpen={selectedSensor !== null}
          onClose={closeModal}
          onAction={handleAction}
          axisX={axisX}
          axisY={axisY}
          axisZ={axisZ}
          isConfirming={isConfirming}
          onInputChange={handleInputChange}
        />
      )}
    </div>
  );
}

export default App;
