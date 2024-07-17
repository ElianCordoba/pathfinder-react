
interface Venue {
  id: string;
  admins: string[]
  name: string
  phone: string
  address: any
  socialMedia: Map<string, string>
}

interface Categories {
  id: string
  venueId: string;
  name: string
  parentId: string | undefined 
}

interface Item {
  categoriesId: string
  name: string
  price: string
  description: string
  tags: string[]
  imagesUrl: string[]
}

// vegano, celiaco
interface Tags {
  id: string
  name: string
}