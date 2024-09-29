import React, { useEffect, useState } from "react";
import AccountNav from "../AccountNav";
import axios from "axios";
import PlaceImg from "../PlaceImg";
import { differenceInBusinessDays, format } from "date-fns";
import { Link } from "react-router-dom";
import BookingDates from "./BookingDates";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get("/bookings").then((response) => {
      setBookings(response.data);
    });
  }, []);

  return (
    <div>
      <AccountNav />

      <div>
        {bookings?.length > 0 &&
          bookings.map((booking) => (
            <Link
              to={`/account/bookings/${booking._id}`}
              className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden"
            >
              <div className="w-48">
                <PlaceImg place={booking.place} />
              </div>
              <div className="py-3 pr-3 grow">
                <h2 className="text-xl">{booking.place.title}</h2>

                <BookingDates booking={booking} className={""} />

                <div className="text-xl">
                  {differenceInBusinessDays(
                    new Date(booking.checkOut),
                    new Date(booking.checkIn)
                  )}{" "}
                  nights | Total price : ${booking.price}
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default BookingsPage;
