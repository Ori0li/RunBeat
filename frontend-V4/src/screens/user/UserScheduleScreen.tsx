import { createRecord, deleteRecord, getRecords } from "@/libs/api/records";
import ScheduleTab from "@/src/components/common/ScheduleTab";
import UseContainer from "@/src/components/common/UseContainer";
import AddScheduleModal from "@/src/components/user/AddScheduleModal";
import { MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import AnalysisModal from "@/src/screens/user/AnalysisModal";

interface ScheduleData {
  id: number;
  tag: "식단" | "운동";
  date: string;
  content: string;
  image?: string;
}

export default function UserScheduleScreen() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTab, setSelectedTab] = useState<"식단" | "운동">("식단");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [analysisImageUrl, setAnalysisImageUrl] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const date = selectedDate.format("YYYY-MM-DD");
      const data = await getRecords(date);
      setSchedules(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "기록을 불러오는데 실패했습니다.",
      );
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "기록을 불러오는데 실패했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const handleMonthChange = (monthIndex: number) => {
    const updated = currentMonth.month(monthIndex);
    setCurrentMonth(updated);
    setSelectedDate(updated.date(1));
  };

  const handleAddSchedule = async (data: {
    content: string;
    tag: "식단" | "운동";
    image?: string;
  }) => {
    try {
      const date = selectedDate.format("YYYY-MM-DD");
      await createRecord({
        date,
        content: data.content,
        tag: data.tag,
        image: data.image,
      });
      Alert.alert("성공", "기록이 추가되었습니다.");
      setIsModalVisible(false);
      fetchSchedules();
    } catch (err) {
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "기록 추가에 실패했습니다.",
      );
    }
  };

  const handleDeleteSchedule = async (id: number, tag: "식단" | "운동") => {
    try {
      await deleteRecord(id, tag);
      Alert.alert("성공", "기록이 삭제되었습니다.");
      fetchSchedules();
    } catch (err) {
      Alert.alert(
        "오류",
        err instanceof Error ? err.message : "기록 삭제에 실패했습니다.",
      );
    }
  };

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.tag === selectedTab &&
      schedule.date === selectedDate.format("YYYY-MM-DD"),
  );

  return (
    <UseContainer>
      <View style={{ flex: 1, marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          {/* <View>
            <MonthSelector
              selectedMonth={currentMonth.month()}
              onMonthChange={handleMonthChange}
            />
          </View>
          <View style={{ marginBottom: 20, marginTop: 10 }}>
            <DaySelector
              daysInMonth={Array.from(
                { length: currentMonth.daysInMonth() },
                (_, i) => currentMonth.date(i + 1)
              )}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </View> */}
          <CalendarStrip
            style={{ height: 150, paddingVertical: 20 }}
            calendarHeaderStyle={{
              color: "white",
              fontSize: 20,
              marginBottom: 10,
            }}
            calendarColor={"#3C23D7"}
            dateNumberStyle={{ color: "white", fontSize: 16 }}
            highlightDateContainerStyle={{
              backgroundColor: "#ffffff",
              borderRadius: 9999,
            }}
            iconContainer={{ flex: 0.1 }}
            highlightDateNumberStyle={{ color: "#3C23D7", fontSize: 16 }}
            showDayName={false}
            iconStyle={{ color: "#ffffff", fontSize: 16 }}
            selectedDate={selectedDate.toDate()}
            onDateSelected={(date) => {
              if (date instanceof Date) {
                setSelectedDate(dayjs(date));
              } else {
                setSelectedDate(dayjs(date.toDate()));
              }
            }}
            markedDates={schedules.map((schedule) => ({
              date: schedule.date,
              dots: [
                {
                  color: "#ffffff",
                  selectedColor: "#3C23D7",
                },
              ],
            }))}
          />

          <View>
            <ScheduleTab
              selectedTab={selectedTab}
              setSelectedTab={(tab) => setSelectedTab(tab as "식단" | "운동")}
            />
          </View>

          <ScrollView style={{ flex: 1 }}>
            {loading ? (
              <Text style={styles.loadingText}>로딩 중...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : filteredSchedules.length === 0 ? (
              <Text style={styles.emptyText}>등록된 기록이 없습니다.</Text>
            ) : (
              filteredSchedules.map((schedule) => (
                <View key={schedule.id} style={styles.card}>
                  <View style={styles.cardContent}>
                    {schedule.image && (
                      <TouchableOpacity
                        onPress={() => {
                          if (schedule.tag === "식단") {
                            setAnalysisImageUrl(schedule.image ?? null); // 클릭한 이미지 URL 저장
                            setAnalysisModalVisible(true); // 분석용 모달 열기
                          }
                        }}
                      >
                        <Image
                          source={{ uri: schedule.image }}
                          style={styles.image}
                        />
                      </TouchableOpacity>
                    )}
                    <View style={styles.textContainer}>
                      <Text style={styles.cardText}>{schedule.content}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteSchedule(schedule.id, schedule.tag)
                      }
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="close" size={20} color="gray" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
        <View style={styles.fixedButtonWrapper}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={1}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <AddScheduleModal
          isVisible={isModalVisible}
          initialTab={selectedTab}
          onClose={() => setIsModalVisible(false)}
          onAdd={handleAddSchedule}
        />
      </View>
      {analysisImageUrl && (
        <AnalysisModal
          visible={analysisModalVisible}
          imageUrl={analysisImageUrl}
          onClose={() => {
            setAnalysisModalVisible(false);
            setAnalysisImageUrl(null);
          }}
        />
      )}
    </UseContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  fixedButtonWrapper: {
    width: "100%",
  },
  addButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#C0C0C0",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#C0C0C0",
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  deleteButton: {
    padding: 4,
  },
});
