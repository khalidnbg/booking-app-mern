import axios from "axios";
import { differenceInCalendarDays } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const BookingWidget = ({ place }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [redirect, setRedirect] = useState("");

  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
  }

  async function bookThisPlace() {
    const response = await axios.post("/bookings", {
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      place: place._id,
      price: numberOfGuests * place.price,
    });

    const bookingId = response.data._id;
    setRedirect("/account/bookings/" + bookingId);
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">
        price : ${place.price} / per night
      </div>

      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className=" py-3 px-4">
            <label>Check in :</label>
            <input
              value={checkIn}
              onChange={(ev) => setCheckIn(ev.target.value)}
              type="date"
            />
          </div>

          <div className=" py-3 px-4 border-l">
            <label>Check out :</label>
            <input
              value={checkOut}
              onChange={(ev) => setCheckOut(ev.target.value)}
              type="date"
            />
          </div>
        </div>

        <div className=" py-3 px-4 border-t">
          <label>Number of guests :</label>
          <input
            value={numberOfGuests}
            onChange={(ev) => setNumberOfGuests(ev.target.value)}
            type="number"
          />
        </div>

        {numberOfGuests > 0 && (
          <div className=" py-3 px-4 border-t">
            <label>Your full name :</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="John Doe"
            />

            <label>Phone number :</label>
            <input
              type="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
            />
          </div>
        )}
      </div>

      <button onClick={bookThisPlace} className="primary mt-4">
        Book this place
        {numberOfNights > 0 && <span> ${numberOfNights * place.price}</span>}
      </button>
    </div>
  );
};

export default BookingWidget;
