
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  "public": {
          Tables: {
            "announcements": {
                  Row: {
                    "author_id": string,"content": string | null,"created_at": string,"id": string,"room_id": string,"status": Database["public"]['Enums']["content_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"content"?: string | null,"created_at"?: string,"id"?: string,"room_id": string,"status"?: Database["public"]['Enums']["content_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string,"content"?: string | null,"created_at"?: string,"id"?: string,"room_id"?: string,"status"?: Database["public"]['Enums']["content_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "announcements_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "announcements_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "announcements_room_id_fkey"
      columns: ["room_id"]
isOneToOne: false
      referencedRelation: "rooms"
      referencedColumns: ["id"]
    }
                  ]
                },"answers": {
                  Row: {
                    "attempt_id": string,"created_at": string,"first_submitted_at": string | null,"id": string,"is_correct": boolean,"question_id": string,"submitted": NonNullable<Json>,"xp_earned": number
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_id": string,"created_at"?: string,"first_submitted_at"?: string | null,"id"?: string,"is_correct"?: boolean,"question_id": string,"submitted"?: NonNullable<Json>,"xp_earned"?: number
                  }
                  Update: {
                    "attempt_id"?: string,"created_at"?: string,"first_submitted_at"?: string | null,"id"?: string,"is_correct"?: boolean,"question_id"?: string,"submitted"?: NonNullable<Json>,"xp_earned"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "answers_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: false
      referencedRelation: "attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "answers_question_id_fkey"
      columns: ["question_id"]
isOneToOne: false
      referencedRelation: "questions"
      referencedColumns: ["id"]
    }
                  ]
                },"attempts": {
                  Row: {
                    "correct_count": number,"course_id": string | null,"finished_at": string | null,"id": string,"lesson_id": string,"room_id": string | null,"started_at": string,"total_count": number,"user_id": string,"xp_earned": number
                  }
                  ComputedFields: never
                  Insert: {
                    "correct_count"?: number,"course_id"?: string | null,"finished_at"?: string | null,"id"?: string,"lesson_id": string,"room_id"?: string | null,"started_at"?: string,"total_count"?: number,"user_id": string,"xp_earned"?: number
                  }
                  Update: {
                    "correct_count"?: number,"course_id"?: string | null,"finished_at"?: string | null,"id"?: string,"lesson_id"?: string,"room_id"?: string | null,"started_at"?: string,"total_count"?: number,"user_id"?: string,"xp_earned"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "attempts_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempts_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempts_room_id_fkey"
      columns: ["room_id"]
isOneToOne: false
      referencedRelation: "rooms"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attempts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "attempts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"comments": {
                  Row: {
                    "author_id": string,"content": string,"course_id": string | null,"created_at": string,"id": string,"lesson_id": string | null,"parent_id": string | null,"status": Database["public"]['Enums']["content_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"content": string,"course_id"?: string | null,"created_at"?: string,"id"?: string,"lesson_id"?: string | null,"parent_id"?: string | null,"status"?: Database["public"]['Enums']["content_status"],"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string,"content"?: string,"course_id"?: string | null,"created_at"?: string,"id"?: string,"lesson_id"?: string | null,"parent_id"?: string | null,"status"?: Database["public"]['Enums']["content_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "comments_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "comments_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "comments_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "comments_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "comments_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "comments"
      referencedColumns: ["id"]
    }
                  ]
                },"completions": {
                  Row: {
                    "attempt_id": string | null,"completed_at": string,"context": string,"id": string,"lesson_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_id"?: string | null,"completed_at"?: string,"context": string,"id"?: string,"lesson_id": string,"user_id": string
                  }
                  Update: {
                    "attempt_id"?: string | null,"completed_at"?: string,"context"?: string,"id"?: string,"lesson_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "completions_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: false
      referencedRelation: "attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "completions_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "completions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "completions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"courses": {
                  Row: {
                    "category": string | null,"cover_url": string | null,"created_at": string,"creator_id": string,"description": string | null,"duration_minutes": number,"id": string,"published_at": string | null,"slug": string,"status": Database["public"]['Enums']["course_status"],"tags": (string)[],"title": string,"updated_at": string,"visibility": Database["public"]['Enums']["course_visibility"]
                  }
                  ComputedFields: never
                  Insert: {
                    "category"?: string | null,"cover_url"?: string | null,"created_at"?: string,"creator_id": string,"description"?: string | null,"duration_minutes"?: number,"id"?: string,"published_at"?: string | null,"slug": string,"status"?: Database["public"]['Enums']["course_status"],"tags"?: (string)[],"title": string,"updated_at"?: string,"visibility"?: Database["public"]['Enums']["course_visibility"]
                  }
                  Update: {
                    "category"?: string | null,"cover_url"?: string | null,"created_at"?: string,"creator_id"?: string,"description"?: string | null,"duration_minutes"?: number,"id"?: string,"published_at"?: string | null,"slug"?: string,"status"?: Database["public"]['Enums']["course_status"],"tags"?: (string)[],"title"?: string,"updated_at"?: string,"visibility"?: Database["public"]['Enums']["course_visibility"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "courses_creator_id_fkey"
      columns: ["creator_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "courses_creator_id_fkey"
      columns: ["creator_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"enrollments": {
                  Row: {
                    "course_id": string,"created_at": string,"id": string,"progress": number,"status": Database["public"]['Enums']["enrollment_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "course_id": string,"created_at"?: string,"id"?: string,"progress"?: number,"status"?: Database["public"]['Enums']["enrollment_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "course_id"?: string,"created_at"?: string,"id"?: string,"progress"?: number,"status"?: Database["public"]['Enums']["enrollment_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "enrollments_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "enrollments_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "enrollments_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"friendships": {
                  Row: {
                    "addressee_id": string,"created_at": string,"id": string,"requester_id": string,"responded_at": string | null,"status": Database["public"]['Enums']["friendship_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "addressee_id": string,"created_at"?: string,"id"?: string,"requester_id": string,"responded_at"?: string | null,"status"?: Database["public"]['Enums']["friendship_status"]
                  }
                  Update: {
                    "addressee_id"?: string,"created_at"?: string,"id"?: string,"requester_id"?: string,"responded_at"?: string | null,"status"?: Database["public"]['Enums']["friendship_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "friendships_addressee_id_fkey"
      columns: ["addressee_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "friendships_addressee_id_fkey"
      columns: ["addressee_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "friendships_requester_id_fkey"
      columns: ["requester_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "friendships_requester_id_fkey"
      columns: ["requester_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"learning_results": {
                  Row: {
                    "attempt_id": string,"confirmed_at": string,"correct_count": number,"course_id": string | null,"legacy": boolean,"lesson_id": string,"room_id": string | null,"total_count": number,"user_id": string,"xp_earned": number
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_id": string,"confirmed_at": string,"correct_count": number,"course_id"?: string | null,"legacy": boolean,"lesson_id": string,"room_id"?: string | null,"total_count": number,"user_id": string,"xp_earned": number
                  }
                  Update: {
                    "attempt_id"?: string,"confirmed_at"?: string,"correct_count"?: number,"course_id"?: string | null,"legacy"?: boolean,"lesson_id"?: string,"room_id"?: string | null,"total_count"?: number,"user_id"?: string,"xp_earned"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "learning_results_attempt_id_fkey"
      columns: ["attempt_id"]
isOneToOne: true
      referencedRelation: "attempts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "learning_results_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "learning_results_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "learning_results_room_id_fkey"
      columns: ["room_id"]
isOneToOne: false
      referencedRelation: "rooms"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "learning_results_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "learning_results_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"lessons": {
                  Row: {
                    "content": string | null,"created_at": string,"id": string,"module_id": string,"position": number,"status": Database["public"]['Enums']["content_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: string | null,"created_at"?: string,"id"?: string,"module_id": string,"position"?: number,"status"?: Database["public"]['Enums']["content_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "content"?: string | null,"created_at"?: string,"id"?: string,"module_id"?: string,"position"?: number,"status"?: Database["public"]['Enums']["content_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lessons_module_id_fkey"
      columns: ["module_id"]
isOneToOne: false
      referencedRelation: "modules"
      referencedColumns: ["id"]
    }
                  ]
                },"medals": {
                  Row: {
                    "code": string,"description": string,"icon": string | null,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"description": string,"icon"?: string | null,"name": string
                  }
                  Update: {
                    "code"?: string,"description"?: string,"icon"?: string | null,"name"?: string
                  }
                  Relationships: [

                  ]
                },"mission_progress": {
                  Row: {
                    "completed": boolean,"id": string,"mission_id": string,"progress": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed"?: boolean,"id"?: string,"mission_id": string,"progress"?: number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "completed"?: boolean,"id"?: string,"mission_id"?: string,"progress"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "mission_progress_mission_id_fkey"
      columns: ["mission_id"]
isOneToOne: false
      referencedRelation: "missions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "mission_progress_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "mission_progress_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"missions": {
                  Row: {
                    "author_id": string,"created_at": string,"deadline": string | null,"description": string | null,"id": string,"min_correct": number,"reward_xp": number,"room_id": string,"status": Database["public"]['Enums']["content_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"created_at"?: string,"deadline"?: string | null,"description"?: string | null,"id"?: string,"min_correct"?: number,"reward_xp"?: number,"room_id": string,"status"?: Database["public"]['Enums']["content_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string,"created_at"?: string,"deadline"?: string | null,"description"?: string | null,"id"?: string,"min_correct"?: number,"reward_xp"?: number,"room_id"?: string,"status"?: Database["public"]['Enums']["content_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "missions_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "missions_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "missions_room_id_fkey"
      columns: ["room_id"]
isOneToOne: false
      referencedRelation: "rooms"
      referencedColumns: ["id"]
    }
                  ]
                },"modules": {
                  Row: {
                    "color": string | null,"course_id": string,"created_at": string,"description": string | null,"icon": string,"id": string,"position": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "color"?: string | null,"course_id": string,"created_at"?: string,"description"?: string | null,"icon"?: string,"id"?: string,"position"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "color"?: string | null,"course_id"?: string,"created_at"?: string,"description"?: string | null,"icon"?: string,"id"?: string,"position"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "modules_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    }
                  ]
                },"notebook_pages": {
                  Row: {
                    "content": string | null,"created_at": string,"id": string,"notebook_id": string,"position": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: string | null,"created_at"?: string,"id"?: string,"notebook_id": string,"position"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "content"?: string | null,"created_at"?: string,"id"?: string,"notebook_id"?: string,"position"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notebook_pages_notebook_id_fkey"
      columns: ["notebook_id"]
isOneToOne: false
      referencedRelation: "notebooks"
      referencedColumns: ["id"]
    }
                  ]
                },"notebooks": {
                  Row: {
                    "created_at": string,"id": string,"title": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"title": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notebooks_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "notebooks_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "created_at": string,"id": string,"is_read": boolean,"message": string | null,"recipient_id": string,"reference_id": string | null,"title": string,"type": Database["public"]['Enums']["notification_type"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_read"?: boolean,"message"?: string | null,"recipient_id": string,"reference_id"?: string | null,"title": string,"type": Database["public"]['Enums']["notification_type"]
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_read"?: boolean,"message"?: string | null,"recipient_id"?: string,"reference_id"?: string | null,"title"?: string,"type"?: Database["public"]['Enums']["notification_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_recipient_id_fkey"
      columns: ["recipient_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "notifications_recipient_id_fkey"
      columns: ["recipient_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "account_status": Database["public"]['Enums']["account_status"],"avatar_url": string | null,"banner_url": string | null,"bio": string | null,"created_at": string,"display_name": string,"id": string,"last_study_date": string | null,"level": number,"notification_preferences": NonNullable<Json>,"role": Database["public"]['Enums']["user_role"],"streak_count": number,"updated_at": string,"username": string,"xp_global": number
                  }
                  ComputedFields: never
                  Insert: {
                    "account_status"?: Database["public"]['Enums']["account_status"],"avatar_url"?: string | null,"banner_url"?: string | null,"bio"?: string | null,"created_at"?: string,"display_name": string,"id": string,"last_study_date"?: string | null,"level"?: number,"notification_preferences"?: NonNullable<Json>,"role"?: Database["public"]['Enums']["user_role"],"streak_count"?: number,"updated_at"?: string,"username": string,"xp_global"?: number
                  }
                  Update: {
                    "account_status"?: Database["public"]['Enums']["account_status"],"avatar_url"?: string | null,"banner_url"?: string | null,"bio"?: string | null,"created_at"?: string,"display_name"?: string,"id"?: string,"last_study_date"?: string | null,"level"?: number,"notification_preferences"?: NonNullable<Json>,"role"?: Database["public"]['Enums']["user_role"],"streak_count"?: number,"updated_at"?: string,"username"?: string,"xp_global"?: number
                  }
                  Relationships: [

                  ]
                },"questions": {
                  Row: {
                    "config": NonNullable<Json>,"created_at": string,"explanation": string | null,"id": string,"lesson_id": string,"position": number,"prompt": string,"type": Database["public"]['Enums']["question_type"],"updated_at": string,"xp_value": number
                  }
                  ComputedFields: never
                  Insert: {
                    "config"?: NonNullable<Json>,"created_at"?: string,"explanation"?: string | null,"id"?: string,"lesson_id": string,"position"?: number,"prompt": string,"type": Database["public"]['Enums']["question_type"],"updated_at"?: string,"xp_value"?: number
                  }
                  Update: {
                    "config"?: NonNullable<Json>,"created_at"?: string,"explanation"?: string | null,"id"?: string,"lesson_id"?: string,"position"?: number,"prompt"?: string,"type"?: Database["public"]['Enums']["question_type"],"updated_at"?: string,"xp_value"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "questions_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "comment": string | null,"course_id": string,"created_at": string,"id": string,"rating": number,"status": Database["public"]['Enums']["content_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "comment"?: string | null,"course_id": string,"created_at"?: string,"id"?: string,"rating": number,"status"?: Database["public"]['Enums']["content_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "comment"?: string | null,"course_id"?: string,"created_at"?: string,"id"?: string,"rating"?: number,"status"?: Database["public"]['Enums']["content_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "reviews_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"room_members": {
                  Row: {
                    "id": string,"joined_at": string,"pac_internal": number,"progress": number,"removed_at": string | null,"room_id": string,"status": Database["public"]['Enums']["room_member_status"],"user_id": string,"xp_internal": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"joined_at"?: string,"pac_internal"?: number,"progress"?: number,"removed_at"?: string | null,"room_id": string,"status"?: Database["public"]['Enums']["room_member_status"],"user_id": string,"xp_internal"?: number
                  }
                  Update: {
                    "id"?: string,"joined_at"?: string,"pac_internal"?: number,"progress"?: number,"removed_at"?: string | null,"room_id"?: string,"status"?: Database["public"]['Enums']["room_member_status"],"user_id"?: string,"xp_internal"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "room_members_room_id_fkey"
      columns: ["room_id"]
isOneToOne: false
      referencedRelation: "rooms"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "room_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "room_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"rooms": {
                  Row: {
                    "access_code": string,"code_active": boolean,"course_id": string | null,"created_at": string,"educator_id": string,"id": string,"name": string,"pac_visibility": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "access_code": string,"code_active"?: boolean,"course_id"?: string | null,"created_at"?: string,"educator_id": string,"id"?: string,"name": string,"pac_visibility"?: string,"updated_at"?: string
                  }
                  Update: {
                    "access_code"?: string,"code_active"?: boolean,"course_id"?: string | null,"created_at"?: string,"educator_id"?: string,"id"?: string,"name"?: string,"pac_visibility"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rooms_course_id_fkey"
      columns: ["course_id"]
isOneToOne: false
      referencedRelation: "courses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "rooms_educator_id_fkey"
      columns: ["educator_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "rooms_educator_id_fkey"
      columns: ["educator_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_medals": {
                  Row: {
                    "acquired_at": string,"featured": boolean,"id": string,"medal_code": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "acquired_at"?: string,"featured"?: boolean,"id"?: string,"medal_code": string,"user_id": string
                  }
                  Update: {
                    "acquired_at"?: string,"featured"?: boolean,"id"?: string,"medal_code"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_medals_medal_code_fkey"
      columns: ["medal_code"]
isOneToOne: false
      referencedRelation: "medals"
      referencedColumns: ["code"]
    },{
      foreignKeyName: "user_medals_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "global_ranking"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "user_medals_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "global_ranking": {
                  Row: {
                    "avatar_url": string | null,"display_name": string | null,"level": number | null,"position": number | null,"streak_count": number | null,"user_id": string | null,"username": string | null,"xp_global": number | null
                  }
                  ComputedFields: never
                  Relationships: [

                  ]
                }
          }
          Functions: {
            "complete_empty_lesson":
{ Args: { "p_lesson_id": string }; Returns: undefined
                           },
"create_notification":
{ Args: { "p_message"?: string,"p_recipient_id": string,"p_reference_id"?: string,"p_title": string,"p_type": Database["public"]['Enums']["notification_type"] }; Returns: string
                           },
"deactivate_account":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"division_for_pac":
{ Args: { "p_pac": number }; Returns: string
                           },
"estimate_course_duration":
{ Args: { "p_course_id": string }; Returns: number
                           },
"finalize_attempt":
{ Args: { "p_attempt_id": string }; Returns: {
              "correct_count": number,"total_count": number,"xp_earned": number
            }[]
                           },
"friends_course_pac":
{ Args: { "p_course_id": string }; Returns: {
              "avatar_url": string,"correct": number,"display_name": string,"division": string,"is_self": boolean,"pac": number,"total": number,"user_id": string,"username": string
            }[]
                           },
"get_attempt_confirmation":
{ Args: { "p_attempt_id": string }; Returns: {
              "attempt_id": string,"confirmed_at": string,"correct_count": number,"legacy": boolean,"total_count": number,"xp_earned": number
            }[]
                           },
"grade_answer":
{ Args: { "p_config": Json,"p_submitted": Json,"p_type": Database["public"]['Enums']["question_type"],"p_xp_value": number }; Returns: {
              "is_correct": boolean,"xp": number
            }[]
                           },
"grant_medals":
{ Args: { "p_user_id": string }; Returns: undefined
                           },
"is_active_room_member":
{ Args: { "p_room_id": string }; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_room_educator":
{ Args: { "p_room_id": string,"p_user_id"?: string }; Returns: boolean
                           },
"is_room_member":
{ Args: { "p_room_id": string,"p_user_id": string }; Returns: boolean
                           },
"join_room":
{ Args: { "p_access_code": string }; Returns: string
                           },
"level_for_xp":
{ Args: { "p_xp": number }; Returns: number
                           },
"normalize_fill_blank":
{ Args: { "p_text": string }; Returns: string
                           },
"notify_course_update":
{ Args: { "p_course_id": string }; Returns: number
                           },
"notify_friend_request":
{ Args: { "p_friendship_id": string }; Returns: string
                           },
"notify_room_invite":
{ Args: { "p_room_id": string,"p_user_id": string }; Returns: string
                           },
"notify_room_mission":
{ Args: { "p_mission_id": string }; Returns: number
                           },
"pac":
{ Args: { "p_correct": number,"p_total": number }; Returns: number
                           },
"recompute_course_duration":
{ Args: { "p_course_id": string }; Returns: undefined
                           },
"recompute_course_progress":
{ Args: { "p_course_id": string,"p_user_id": string }; Returns: number
                           },
"recompute_room_metrics":
{ Args: { "p_room_id": string,"p_user_id": string }; Returns: undefined
                           },
"resolve_login_email":
{ Args: { "p_password": string,"p_username": string }; Returns: string
                           },
"save_attempt_answer":
{ Args: { "p_attempt_id": string,"p_question_id": string,"p_submitted": Json }; Returns: {
              "attempt_id": string,
"created_at": string,
"first_submitted_at": string | null,
"id": string,
"is_correct": boolean,
"question_id": string,
"submitted": NonNullable<Json>,
"xp_earned": number
            }[]
                          SetofOptions: {
        from: "*"
        to: "answers"
        isOneToOne: false
        isSetofReturn: true
      } },
"search_profiles":
{ Args: { "p_query": string }; Returns: {
              "avatar_url": string,"display_name": string,"id": string,"level": number,"username": string
            }[]
                           },
"send_study_reminder":
{ Args: { "p_friend_id": string }; Returns: string
                           },
"touch_streak":
{ Args: { "p_user_id": string }; Returns: undefined
                           },
"unaccent":
{ Args: { "": string }; Returns: string
                           },
"xp_from_question":
{ Args: { "p_type": Database["public"]['Enums']["question_type"] }; Returns: number
                           }
          }
          Enums: {
            "account_status": "active"|"deactivated","content_status": "draft"|"published"|"archived","course_status": "draft"|"published","course_visibility": "public"|"private","enrollment_status": "active"|"completed"|"dropped","friendship_status": "pending"|"accepted"|"declined"|"cancelled","notification_type": "atualizacao_curso"|"pedido_amizade"|"convite_sala"|"missao"|"lembrete_estudo","question_type": "match"|"multiple_choice"|"fill_blank"|"sum_alternatives","room_member_status": "active"|"removed","user_role": "student"|"educator"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "account_status": ["active", "deactivated"],"content_status": ["draft", "published", "archived"],"course_status": ["draft", "published"],"course_visibility": ["public", "private"],"enrollment_status": ["active", "completed", "dropped"],"friendship_status": ["pending", "accepted", "declined", "cancelled"],"notification_type": ["atualizacao_curso", "pedido_amizade", "convite_sala", "missao", "lembrete_estudo"],"question_type": ["match", "multiple_choice", "fill_blank", "sum_alternatives"],"room_member_status": ["active", "removed"],"user_role": ["student", "educator", "admin"]
          }
        }
} as const
