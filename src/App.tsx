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
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import axios from "axios";

// Налаштування модального вікна
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
    const socket = io("http://localhost:3000", {
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

  const countLeaveArea = (
    position: number[],
    waterSpeed: number[],
    thrusterSpeed: number[]
  ): string => {
    const maxPosition = 10000;
    const epsilon = 1e-10;

    if (
      position.length !== 3 ||
      waterSpeed.length !== 3 ||
      thrusterSpeed.length !== 3
    ) {
      return "Invalid input data";
    }

    const axisSpeed = position.map((_, i) => waterSpeed[i] + thrusterSpeed[i]);

    let minPositiveTime = Infinity;

    for (let i = 0; i < 3; i++) {
      const distanceToPositiveBoundary = maxPosition - position[i];
      const distanceToNegativeBoundary = -maxPosition - position[i];

      if (distanceToPositiveBoundary <= 0 || distanceToNegativeBoundary >= 0) {
        return "0.00";
      }

      if (Math.abs(axisSpeed[i]) > epsilon) {
        const timeToPositiveBoundary =
          distanceToPositiveBoundary / axisSpeed[i];
        const timeToNegativeBoundary =
          distanceToNegativeBoundary / axisSpeed[i];

        const timeToReachBoundary = Math.min(
          timeToPositiveBoundary > 0 ? timeToPositiveBoundary : Infinity,
          timeToNegativeBoundary > 0 ? timeToNegativeBoundary : Infinity
        );

        if (timeToReachBoundary > 0 && timeToReachBoundary < minPositiveTime) {
          minPositiveTime = timeToReachBoundary;
        }
      }
    }

    return minPositiveTime === Infinity ? "Never" : minPositiveTime.toFixed(2);
  };

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

  const updateThrusterSpeed = async (
    name: string,
    updateThrusterSpeedDto: any
  ) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/sensor/${name}/thruster`,
        updateThrusterSpeedDto
      );
      console.log("Успішно оновлено швидкість:", updateThrusterSpeedDto, name);
      return response.data;
    } catch (error) {
      console.error("Помилка при оновленні швидкості:", error);
    }
  };

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
        <Modal
          isOpen={true}
          onRequestClose={closeModal}
          contentLabel="Sensor Details"
          className="absolute w-svw h-svh flex justify-center items-center"
        >
          <div className="relative w-[600px] h-[400px] bg-white flex flex-col border-black border-2 rounded-lg">
            <h2 className="font-semibold text-6xl text-center">
              {selectedSensor.name}
            </h2>
            <p className="text-center text-xl">
              {selectedSensor.temperature.toFixed(2)} °C
            </p>
            <div className="flex gap-5 my-2 justify-around">
              <div className="pl-2">
                <p className="text-green-300">Position</p>
                <ul>
                  <li>{selectedSensor.position[0].toFixed(2)}</li>
                  <li>{selectedSensor.position[1].toFixed(2)}</li>
                  <li>{selectedSensor.position[2].toFixed(2)}</li>
                </ul>
              </div>
              <div className=" px-2">
                <p className="text-blue-300">Water Speed</p>
                <ul>
                  <li>{selectedSensor.waterSpeed[0].toFixed(2)}</li>
                  <li>{selectedSensor.waterSpeed[1].toFixed(2)}</li>
                  <li>{selectedSensor.waterSpeed[2].toFixed(2)}</li>
                </ul>
              </div>
              <div className="pr-2">
                <p className="text-red-300">Thruster Speed</p>
                <ul>
                  <li>{selectedSensor.thrustersSpeed[0].toFixed(2)}</li>
                  <li>{selectedSensor.thrustersSpeed[1].toFixed(2)}</li>
                  <li>{selectedSensor.thrustersSpeed[2].toFixed(2)}</li>
                </ul>
              </div>
            </div>
            <p className="text-xl text-center mt-4">Add speed to thruster:</p>
            <div className="flex justify-around">
              <Input
                name="axisX"
                type="number"
                placeholder="Axis: x"
                className="w-24"
                value={axisX}
                onChange={handleInputChange}
              />
              <Input
                name="axisY"
                type="number"
                placeholder="Axis: y"
                className="w-24"
                value={axisY}
                onChange={handleInputChange}
              />
              <Input
                name="axisZ"
                type="number"
                placeholder="Axis: z"
                className="w-24"
                value={axisZ}
                onChange={handleInputChange}
              />
            </div>
            <Button
              onClick={() => handleAction(selectedSensor.name)}
              className="w-32 self-center mt-12"
            >
              {isConfirming ? "Confirm" : "Close"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
