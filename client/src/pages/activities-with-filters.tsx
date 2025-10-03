import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MessageSquare, Phone, Mail, Users, Filter, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: number;
  type: string;
  subject: string;
  description: string;
  contact?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  deal?: {
    id: number;
    title: string;
    interestLevel?: {
      level: string;
      color: string;
    };
  };
  user: {
    firstName: string;
    lastName: string;
  };
  scheduledAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface ActivityType {
  id: number;
  typeName: string;
}

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
}

interface InterestLevel {
  id: number;
  level: string;
  color: string;
}

export default function Activities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<string>("all");
  const [selectedInterestLevel, setSelectedInterestLevel] = useState<string>("all");

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: activityTypes = [] } = useQuery<ActivityType[]>({
    queryKey: ["/api/activity-types"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: interestLevels = [] } = useQuery<InterestLevel[]>({
    queryKey: ["/api/interest-levels"],
  });

  // Filter activities based on search and filters
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${activity.contact?.firstName} ${activity.contact?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActivityType = selectedActivityType === "all" || activity.type === selectedActivityType;
    
    const matchesContact = selectedContact === "all" || 
                          (activity.contact && activity.contact.id.toString() === selectedContact);
    
    const matchesInterestLevel = selectedInterestLevel === "all" || 
                                (activity.deal?.interestLevel?.level === selectedInterestLevel);

    return matchesSearch && matchesActivityType && matchesContact && matchesInterestLevel;
  });

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call":
        return Phone;
      case "email":
        return Mail;
      case "meeting":
        return Users;
      default:
        return MessageSquare;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "call":
        return "bg-blue-100 text-blue-800";
      case "email":
        return "bg-green-100 text-green-800";
      case "meeting":
        return "bg-purple-100 text-purple-800";
      case "note":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TopBar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Activity Management</h1>
              <p className="text-slate-600">Track and manage all customer interactions</p>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Activity Type Filter */}
                <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Activity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity Types</SelectItem>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.typeName}>
                        {type.typeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Contact Filter */}
                <Select value={selectedContact} onValueChange={setSelectedContact}>
                  <SelectTrigger>
                    <SelectValue placeholder="Contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.firstName} {contact.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Interest Level Filter */}
                <Select value={selectedInterestLevel} onValueChange={setSelectedInterestLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Interest Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Interest Levels</SelectItem>
                    {interestLevels.map((level) => (
                      <SelectItem key={level.id} value={level.level}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: level.color }}
                          />
                          <span>{level.level}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activities List */}
          {activitiesLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No activities found</h3>
                <p className="text-slate-500">
                  {searchTerm || selectedActivityType !== "all" || selectedContact !== "all" || selectedInterestLevel !== "all"
                    ? "Try adjusting your filters to see more activities."
                    : "No activities have been recorded yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <Card key={activity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-slate-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-slate-900 truncate">
                              {activity.subject}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getActivityTypeColor(activity.type)}>
                                {activity.type}
                              </Badge>
                              {activity.completedAt && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {activity.description && (
                            <p className="text-slate-600 mb-3 line-clamp-2">{activity.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <div className="flex items-center space-x-4">
                              {activity.contact && (
                                <span className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{activity.contact.firstName} {activity.contact.lastName}</span>
                                </span>
                              )}
                              
                              {activity.deal?.interestLevel && (
                                <Badge 
                                  className="text-white border-0" 
                                  style={{ backgroundColor: activity.deal.interestLevel.color }}
                                >
                                  {activity.deal.interestLevel.level}
                                </Badge>
                              )}
                              
                              <span className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{activity.user.firstName} {activity.user.lastName}</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}