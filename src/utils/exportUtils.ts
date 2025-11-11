export interface BookingExport {
  title: string;
  description: string;
  room: string;
  floor: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  organizer: string;
}

export function exportToCSV(bookings: BookingExport[], filename: string) {
  const headers = [
    'Titolo',
    'Descrizione',
    'Sala',
    'Piano',
    'Data',
    'Ora Inizio',
    'Ora Fine',
    'Partecipanti',
    'Organizzatore',
  ];

  const rows = bookings.map(b => [
    b.title,
    b.description,
    b.room,
    b.floor,
    b.date,
    b.startTime,
    b.endTime,
    b.participants,
    b.organizer,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToICS(booking: BookingExport) {
  const startDate = new Date(`${booking.date}T${booking.startTime}`);
  const endDate = new Date(`${booking.date}T${booking.endTime}`);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Meeting Room Booking//EN
BEGIN:VEVENT
UID:${Math.random().toString(36).substring(2, 11)}@meetingroom.local
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${booking.title}
DESCRIPTION:${booking.description}
LOCATION:${booking.room}, ${booking.floor}
ORGANIZER:CN=${booking.organizer}
ATTENDEES:${booking.participants}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${booking.title}.ics`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(bookings: BookingExport[], filename: string) {
  let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length ${calculateContentLength(bookings)} >>
stream
BT
/F1 12 Tf
50 750 Td
(Prenotazioni Sale Riunioni) Tj
0 -30 Td
`;

  bookings.forEach((booking, index) => {
    pdfContent += `(${booking.title} - ${booking.date}) Tj\n0 -15 Td\n`;
  });

  pdfContent += `ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000229 00000 n
0000000331 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${520 + pdfContent.length}
%%EOF`;

  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.pdf`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function calculateContentLength(bookings: BookingExport[]): number {
  return bookings.length * 50 + 200;
}
