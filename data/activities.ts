export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export type Attachment = {
  id: number;
  name: string;
  url: string;
  sizeBytes: number;
};

export type Category = {
  id: string;
  name: string;
}

export type Activity = {
  id: string;
  title: string;
  categories: Category[];
  description: string;
  imageSrc: string;
  imageAlt: string;
  attachments: Attachment[];
};

const activities: Activity[] = [
  {
    id: "directions",
    title: "Directions",
    categories: [
      {
        id:"vocab",
        name:"Vocab",
      },
      {
        id:"conversation",
        name:"Conversation",
      },
    ],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/directions.jpg",
    imageAlt: "Yellow directional road signs against a blue sky",
    attachments: [
      {
        id: 0,
        name: "route-guidelines.pdf",
        url: "/attachments/route-guidelines.pdf",
        sizeBytes: 1_240_000,
      },
      {
        id:1,
        name: "signage-reference.pdf",
        url: "/attachments/signage-reference.pdf",
        sizeBytes: 8_400_000,
      },
    ],
  },
  {
    id: "animals",
    title: "Animals",
    categories: [],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/animals.jpg",
    imageAlt: "A group of different animals standing together",
    attachments: [],
  },
  {
    id: "transportation",
    title: "Transportation",
    categories: [],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/transportation.jpg",
    imageAlt: "View of mountains through a train window",
    attachments: [],
  },
  {
    id: "food",
    title: "Food",
    categories: [],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/food.jpg",
    imageAlt: "A spread of assorted dishes on a table",
    attachments: [],
  },
  {
    id: "sports",
    title: "Sports",
    categories: [],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/sports.jpg",
    imageAlt: "A collection of sports balls and equipment",
    attachments: [],
  },
  {
    id: "music",
    title: "Music",
    categories: [],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/music.jpg",
    imageAlt: "Musical instruments arranged together",
    attachments: [],
  },
  {
    id: "technology",
    title: "Technology",
    categories: [],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/technology.jpg",
    imageAlt: "Various electronic devices laid out on a desk",
    attachments: [],
  },
  {
    id: "nature",
    title: "Nature",
    categories: [],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/nature.jpg",
    imageAlt: "A lush forest landscape",
    attachments: [],
  },
  {
    id: "architecture",
    title: "Architecture",
    categories: [],
    description:
      "Nobis maxime temporibus veritatis est ut est. Est voluptatem quas incidunt deleniti. Magnam in repellendus cupiditate quasi quidem consequatur.",
    imageSrc: "/architecture.jpg",
    imageAlt: "A row of buildings with distinctive facades",
    attachments: [],
  },
  {
    id: "fashion",
    title: "Fashion",
    categories: [],
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