// components/SensorModal.tsx
import React from "react";
import Modal from "react-modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sensor } from "../interfaces/sensor.interface";

interface SensorModalProps {
  sensor: Sensor;
  isOpen: boolean;
  onClose: () => void;
  onAction: (name: string) => void;
  axisX: number;
  axisY: number;
  axisZ: number;
  isConfirming: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SensorModal: React.FC<SensorModalProps> = ({
  sensor,
  isOpen,
  onClose,
  onAction,
  axisX,
  axisY,
  axisZ,
  isConfirming,
  onInputChange,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Sensor Details"
      className="absolute w-svw h-svh flex justify-center items-center"
    >
      <div className="relative w-[600px] h-[400px] bg-white flex flex-col border-black border-2 rounded-lg">
        <h2 className="font-semibold text-6xl text-center">{sensor.name}</h2>
        <p className="text-center text-xl">
          {sensor.temperature.toFixed(2)} °C
        </p>
        <div className="flex gap-5 my-2 justify-around">
          <div className="pl-2">
            <p className="text-green-300">Position</p>
            <ul>
              <li>{sensor.position[0].toFixed(2)}</li>
              <li>{sensor.position[1].toFixed(2)}</li>
              <li>{sensor.position[2].toFixed(2)}</li>
            </ul>
          </div>
          <div className="px-2">
            <p className="text-blue-300">Water Speed</p>
            <ul>
              <li>{sensor.waterSpeed[0].toFixed(2)}</li>
              <li>{sensor.waterSpeed[1].toFixed(2)}</li>
              <li>{sensor.waterSpeed[2].toFixed(2)}</li>
            </ul>
          </div>
          <div className="pr-2">
            <p className="text-red-300">Thruster Speed</p>
            <ul>
              <li>{sensor.thrustersSpeed[0].toFixed(2)}</li>
              <li>{sensor.thrustersSpeed[1].toFixed(2)}</li>
              <li>{sensor.thrustersSpeed[2].toFixed(2)}</li>
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
            onChange={onInputChange}
          />
          <Input
            name="axisY"
            type="number"
            placeholder="Axis: y"
            className="w-24"
            value={axisY}
            onChange={onInputChange}
          />
          <Input
            name="axisZ"
            type="number"
            placeholder="Axis: z"
            className="w-24"
            value={axisZ}
            onChange={onInputChange}
          />
        </div>
        <Button
          onClick={() => onAction(sensor.name)}
          className="w-32 self-center mt-12"
        >
          {isConfirming ? "Confirm" : "Close"}
        </Button>
      </div>
    </Modal>
  );
};

export default SensorModal;
