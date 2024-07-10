import axios from "axios";

const updateThrusterSpeed = async (
  name: string,
  updateThrusterSpeedDto: any
) => {
  try {
    const response = await axios.post(
      import.meta.env.VITE_API_URL + `/sensor/${name}/thruster`,
      updateThrusterSpeedDto
    );
    console.log("Успішно оновлено швидкість:", updateThrusterSpeedDto, name);
    return response.data;
  } catch (error) {
    console.error("Помилка при оновленні швидкості:", error);
  }
};

export { updateThrusterSpeed };
