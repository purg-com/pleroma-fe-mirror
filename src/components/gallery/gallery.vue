<template>
  <div
    ref="galleryContainer"
    class="Gallery"
    :class="{ '-long': tooManyAttachments && hidingLong }"
  >
    <div class="gallery-rows">
      <div
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
        class="gallery-row"
        :style="rowStyle(row)"
        :class="{ '-audio': row.audio, '-minimal': row.minimal, '-grid': grid }"
      >
        <div
          class="gallery-row-inner"
          :class="{ '-grid': grid }"
        >
          <Attachment
            v-for="(attachment, attachmentIndex) in row.items"
            :key="attachment.id"
            class="gallery-item"
            :compact="compact"
            :nsfw="nsfw"
            :attachment="attachment"
            :size="size"
            :editable="editable"
            :remove="removeAttachment"
            :shift-up="!(attachmentIndex === 0 && rowIndex === 0) && shiftUpAttachment"
            :shift-dn="!(attachmentIndex === row.items.length - 1 && rowIndex === rows.length - 1) && shiftDnAttachment"
            :edit="editAttachment"
            :description="descriptions && descriptions[attachment.id]"
            :hide-description="size === 'small' || tooManyAttachments && hidingLong"
            :style="itemStyle(attachment.id, row.items)"
            @set-media="onMedia"
            @natural-size-load="onNaturalSizeLoad"
          />
        </div>
      </div>
    </div>
    <div
      v-if="tooManyAttachments"
      class="many-attachments"
    >
      <div class="many-attachments-text">
        {{ $t("status.many_attachments", { number: attachments.length }) }}
      </div>
      <div class="many-attachments-buttons">
        <span
          v-if="!hidingLong"
          class="many-attachments-button"
        >
          <button
            class="button-unstyled -link"
            @click="toggleHidingLong(true)"
          >
            {{ $t("status.collapse_attachments") }}
          </button>
        </span>
        <span
          v-if="hidingLong"
          class="many-attachments-button"
        >
          <button
            class="button-unstyled -link"
            @click="toggleHidingLong(false)"
          >
            {{ $t("status.show_all_attachments") }}
          </button>
        </span>
        <span
          v-if="hidingLong"
          class="many-attachments-button"
        >
          <button
            class="button-unstyled -link"
            @click="openGallery"
          >
            {{ $t("status.open_gallery") }}
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script src='./gallery.js'></script>

<style lang="scss">
.Gallery {
  .gallery-rows {
    display: flex;
    flex-direction: column;
  }

  .gallery-row {
    position: relative;
    height: 0;
    width: 100%;
    flex-grow: 1;

    .gallery-row-inner {
      position: absolute;
      inset: 0;
      display: flex;
      flex-flow: row wrap;
      align-content: stretch;

      .gallery-item {
        margin: 0 0.5em 0 0;
        flex-grow: 1;
        height: 100%;
        box-sizing: border-box;
        // to make failed images a bit more noticeable on chromium
        min-width: 2em;

        &:last-child {
          margin: 0;
        }
      }

      &.-grid {
        width: 100%;
        height: auto;
        position: relative;
        display: grid;
        grid-gap: 0.5em;
        grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));

        .gallery-item {
          margin: 0;
          height: 200px;
        }
      }
    }

    &.-grid,
    &.-minimal {
      height: auto;

      .gallery-row-inner {
        position: relative;
      }
    }

    &:not(:first-child) {
      margin-top: 0.5em;
    }
  }

  &.-long {
    .gallery-rows {
      max-height: 25em;
      overflow: hidden;
      mask:
        linear-gradient(to top, white, transparent) bottom/100% 70px no-repeat,
        linear-gradient(to top, white, white);

      /* Autoprefixed seem to ignore this one, and also syntax is different */
      /* stylelint-disable mask-composite */
      /* stylelint-disable declaration-property-value-no-unknown */

      /* TODO check if this is still needed */
      mask-composite: xor;
      /* stylelint-enable declaration-property-value-no-unknown */
      /* stylelint-enable mask-composite */
      mask-composite: exclude;
    }
  }

  .many-attachments-text {
    text-align: center;
    line-height: 2;
  }

  .many-attachments-buttons {
    display: flex;
  }

  .many-attachments-button {
    display: flex;
    flex: 1;
    justify-content: center;
    line-height: 2;

    button {
      padding: 0 2em;
    }
  }
}
</style>
