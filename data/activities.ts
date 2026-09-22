export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export type Attachment = {
  id: number;
  name: string;
  url: string;
  sizeBytes: number;
};

export type Activity = {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  attachments: Attachment[];
};

const activities: Activity[] = [
  {
    id: 0,
    title: "Directions",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/directions.jpg",
    imageAlt: "Yellow directional road signs against a blue sky",
    attachments: [
      {
        id: 0,
        name: "Route guidelines.pdf",
        url: "/attachments/route-guidelines.pdf",
        sizeBytes: 1_240_000,
      },
      {
        id:1,
        name: "Signage reference.pdf",
        url: "/attachments/signage-reference.pdf",
        sizeBytes: 8_400_000,
      },
    ],
  },
  {
    id: 1,
    title: "Animals",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/animals.jpg",
    imageAlt: "A group of different animals standing together",
    attachments: [],
  },
  {
    id: 2,
    title: "Transportation",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/transportation.jpg",
    imageAlt: "View of mountains through a train window",
    attachments: [],
  },
  {
    id: 3,
    title: "Food",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/food.jpg",
    imageAlt: "A spread of assorted dishes on a table",
    attachments: [],
  },
  {
    id: 4,
    title: "Sports",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/sports.jpg",
    imageAlt: "A collection of sports balls and equipment",
    attachments: [],
  },
  {
    id: 5,
    title: "Music",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/music.jpg",
    imageAlt: "Musical instruments arranged together",
    attachments: [],
  },
  {
    id: 6,
    title: "Technology",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/technology.jpg",
    imageAlt: "Various electronic devices laid out on a desk",
    attachments: [],
  },
  {
    id: 7,
    title: "Nature",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/nature.jpg",
    imageAlt: "A lush forest landscape",
    attachments: [],
  },
  {
    id: 8,
    title: "Architecture",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/architecture.jpg",
    imageAlt: "A row of buildings with distinctive facades",
    attachments: [],
  },
  {
    id: 9,
    title: "Fashion",
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/fashion.jpg",
    imageAlt: "Clothing items arranged on a rack",
    attachments: [],
  }
];

export async function getActivities(): Promise<Activity[]> {
  return activities;
}